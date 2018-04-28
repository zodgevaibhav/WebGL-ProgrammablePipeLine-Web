 var canvas=null;
 var gl = null;
 var bFullscreen=false;
 var canvas_original_width;
 var canvas_original_height;
 
 var requestAnimationFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame;

// To stop animation : To have cancelAnimationFrame() to be called "cross-browser" compatible
var cancelAnimationFrame =
window.cancelAnimationFrame ||
window.webkitCancelRequestAnimationFrame || window.webkitCancelAnimationFrame ||
window.mozCancelRequestAnimationFrame || window.mozCancelAnimationFrame ||
window.oCancelRequestAnimationFrame || window.oCancelAnimationFrame ||
window.msCancelRequestAnimationFrame || window.msCancelAnimationFrame;

const WebGLMacros=
{
	VVZ_ATTRIBUTE_VERTEX:0,
	VVZ_ATTRIBUTE_COLOR:1,
	VVZ_ATTRIBUTE_NORMAL:2,
	VVZ_ATTRIBUTE_TEXTURE0:3,
	VVZ_ATTRIBUTE_TEXTURE1:4,
	VVZ_ATTRIBUTE_TEXTURE2:5,
};

var vertexShaderObject;
var fragmentShaderObject;
var shaderProgramObject;


var vao_quad;
var vbo_quad;

var vbo_quad_texture
var vbo_quad_textureb
var vbo_quad_texturer

var triangle_texture,quads_texture;


var mvpUniform;
var uniform_textue0_sampler;
var uniform_textue1_sampler;
var uniform_textue2_sampler;

var orthographicProjectionMatrix;


 function main()
 {
	 canvas = document.getElementById("AMC");
	 if(!canvas)
		 console.log("Obtaining canvas failed...\n");
	 else
		 console.log("Canvas obtained successufully...\n");
		 console.log("Canvas width = "+canvas.width+" Canvas height = "+canvas.height +"\n");
	 
	 canvas_original_width=canvas.width;
    canvas_original_height=canvas.height;
	 
	window.addEventListener("keydown",keyDown,false);
	window.addEventListener("click",mouseDown,false);
	window.addEventListener("resize",resize,false);
	
	init();
	
	resize();
	
	draw();
 }
 

 
 function init()
 {
	gl = canvas.getContext("webgl2");
	
	if(gl==null)
	{
		console.log("Unable to create webgl2 context");
		return;
	}
	gl.viewportWidth=canvas.width;
	gl.viewportHeight=canvas.height;
//******************************************** Vertex Shader ***************************************
 var vertexShaderSourceCode=
     "#version 300 es"+
    "\n"+
    "in vec4 vPosition;"+
	"in vec2 vTexture0_cords;"+
	"in vec2 vTexture1_cords;"+
	"in vec2 vTexture2_cords;"+
	"out vec2 vOutTexture0_cords;"+
	"out vec2 vOutTexture1_cords;"+
	"out vec2 vOutTexture2_cords;"+
    "uniform mat4 u_mvp_matrix;"+
    "void main(void)"+
    "{"+
    "gl_Position = u_mvp_matrix * vPosition;"+
	"vOutTexture0_cords=vTexture0_cords;"+
	"vOutTexture1_cords=vTexture1_cords;"+
	"vOutTexture2_cords=vTexture2_cords;"+
    "}";
	
	vertexShaderObject=gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject,vertexShaderSourceCode);
    gl.compileShader(vertexShaderObject);
	
	if(gl.getShaderParameter(vertexShaderObject,gl.COMPILE_STATUS)==false)
    {
        var error=gl.getShaderInfoLog(vertexShaderObject);
        if(error.length > 0)
        {
            alert("Vertex shader: " +error);
            uninitialize();
        }
    }
	
//*********************************************** Fragment Shader ****************************
var fragmentShaderSourceCode=
      "#version 300 es"+
    "\n"+
    "precision highp float;"+
    "in vec2 vOutTexture0_cords;"+
	"in vec2 vOutTexture1_cords;"+
	"in vec2 vOutTexture2_cords;"+
    "uniform highp sampler2D u_texture0_sampler;"+
	"uniform highp sampler2D u_texture1_sampler;"+
	"uniform highp sampler2D u_texture2_sampler;"+
    "out vec4 FragColor;"+
    "void main(void)"+
    "{"+
	"vec4 blenfMapColor = texture(u_texture0_sampler, vOutTexture0_cords);"+
	"float backTextureAmount = 0.9 - (blenfMapColor.r + blenfMapColor.g + blenfMapColor.b);"+
	"vec2 tiledCoords=vOutTexture0_cords*40.0;"+
	"vec4 backGroupTextureColor=texture(u_texture0_sampler,tiledCoords) * backTextureAmount;"+
	"vec4 rTextureColor=texture(u_texture1_sampler,tiledCoords) * blenfMapColor.r;"+
	"vec4 gTextureColor=texture(u_texture2_sampler,tiledCoords) * blenfMapColor.g;"+
	"vec4 totalColor = backGroupTextureColor+rTextureColor+gTextureColor;"+
	
    "FragColor = totalColor;"+
    "}"
  
    fragmentShaderObject=gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject,fragmentShaderSourceCode);
    gl.compileShader(fragmentShaderObject);
    if(gl.getShaderParameter(fragmentShaderObject,gl.COMPILE_STATUS)==false)
    {
        var error=gl.getShaderInfoLog(fragmentShaderObject);
        if(error.length > 0)
        {
            alert("Fragment Shader : "+error);
            uninitialize();
        }
    }
	
	shaderProgramObject=gl.createProgram();
    gl.attachShader(shaderProgramObject,vertexShaderObject);
    gl.attachShader(shaderProgramObject,fragmentShaderObject);
   
  //************* Bind attribute locations
	gl.bindAttribLocation(shaderProgramObject,WebGLMacros.VVZ_ATTRIBUTE_VERTEX,"vPosition");
	gl.bindAttribLocation(shaderProgramObject,WebGLMacros.VVZ_ATTRIBUTE_TEXTURE0,"vTexture0_cords");
	gl.bindAttribLocation(shaderProgramObject,WebGLMacros.VVZ_ATTRIBUTE_TEXTURE1,"vTexture1_cords");
	gl.bindAttribLocation(shaderProgramObject,WebGLMacros.VVZ_ATTRIBUTE_TEXTURE2,"vTexture2_cords");

	
  //************* Link program 
	  gl.linkProgram(shaderProgramObject);
		if (!gl.getProgramParameter(shaderProgramObject, gl.LINK_STATUS))
		{
			var error=gl.getProgramInfoLog(shaderProgramObject);
			if(error.length > 0)
			{
				alert(error);
				uninitialize();
			}
		}
		
//************************** Generate Textures *******************************
    
    // Load cube Textures
    quads_texture = gl.createTexture();
    quads_texture.image = new Image();
    quads_texture.image.src="blendMap.png";
    quads_texture.image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, quads_texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, quads_texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
		

    quads_textureb = gl.createTexture();
    quads_textureb.image = new Image();
    quads_textureb.image.src="Smilyb.png";
    quads_textureb.image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, quads_textureb);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, quads_textureb.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }



    quads_texturer = gl.createTexture();
    quads_texturer.image = new Image();
    quads_texturer.image.src="Smilyr.png";
    quads_texturer.image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, quads_texturer);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, quads_texturer.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }	
	//********** Bind uniforms
		mvpUniform=gl.getUniformLocation(shaderProgramObject,"u_mvp_matrix");
		uniform_textue0_sampler = gl.getUniformLocation(shaderProgramObject,"u_texture0_sampler");
		uniform_textue1_sampler = gl.getUniformLocation(shaderProgramObject,"u_texture1_sampler");
		uniform_textue2_sampler = gl.getUniformLocation(shaderProgramObject,"u_texture2_sampler");
		
//************************* Quads Vertices ***********************
	var quadsVertices=new Float32Array([
             1.0, 1.0, 0.0,  //right-top corner of top face
			-1.0, 1.0, 0.0, //left-top corner of top face
			-1.0, -1.0, 0.0, //left-bottom corner of top face
			1.0, -1.0, 0.0 //right-bottom corner of top face
			]);
	vao_quad=gl.createVertexArray();
    gl.bindVertexArray(vao_quad);
    
    vbo_quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo_quad);
    gl.bufferData(gl.ARRAY_BUFFER,quadsVertices,gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.VVZ_ATTRIBUTE_VERTEX,
                           3, // 3 indicates that array has 3 vertices
                           gl.FLOAT, //data type of the data in vertices
                           false, //is this data normalized (if data is normalized then it must be in range of [0.0,1.0] or [-1.0,1.0]
						   0, // do we want to stride (hops)
						   0); // from where to start reading the vertices, we want it to be read from 0

	gl.enableVertexAttribArray(WebGLMacros.VVZ_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindVertexArray(null);	

		var quadsTextureQuads = new Float32Array([
										0.0,0.0,
                                        1.0,0.0,
                                        1.0,1.0,
                                        0.0,1.0,
            ]);
	gl.bindVertexArray(vao_quad);

	vbo_quad_texture = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_quad_texture);
	gl.bufferData(gl.ARRAY_BUFFER,quadsTextureQuads,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.VVZ_ATTRIBUTE_TEXTURE0,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGLMacros.VVZ_ATTRIBUTE_TEXTURE0);
	
	vbo_quad_texture_b = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_quad_texture);
	gl.bufferData(gl.ARRAY_BUFFER,quadsTextureQuads,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.VVZ_ATTRIBUTE_TEXTURE1,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGLMacros.VVZ_ATTRIBUTE_TEXTURE1);
	
	vbo_quad_texture_r = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_quad_texture);
	gl.bufferData(gl.ARRAY_BUFFER,quadsTextureQuads,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.VVZ_ATTRIBUTE_TEXTURE2,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGLMacros.VVZ_ATTRIBUTE_TEXTURE2);
	
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindVertexArray(null);
	
	gl.clearColor(0.0,0.0,0.0,1.0);
	//gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	//gl.depthFunc(gl.GL_LEQUAL);
	//gl.hint(gl.GL_PERSPECTIVE_CORRECTION_HINT, gl.GL_NICEST);
	//gl.enable(gl.CULL_FACE);	
	
	
	
	//orthographicProjectionMatrix=mat4.create();
	perspectiveProjectionMatrix=mat4.create();
 }
 
 function resize()
 {
	 if(bFullscreen==true)
	 {
		 canvas.width = window.innerWidth;
		 canvas.height = window.innerHeight;
	 }else
	 {
		 canvas.width = canvas_original_width;
		 canvas.height = canvas_original_height;
	 }
	 gl.viewport(0,0,canvas.width,canvas.height);
	 
	
	mat4.perspective(perspectiveProjectionMatrix,degreeToRadion(45.0),canvas.width/canvas.height,0.1,100.0);
	
	/*if (canvas.width <= canvas.height)
        mat4.ortho(orthographicProjectionMatrix, -100.0, 100.0, (-100.0 * (canvas.height / canvas.width)), (100.0 * (canvas.height / canvas.width)), -100.0, 100.0);
	 else
        mat4.ortho(orthographicProjectionMatrix, (-100.0 * (canvas.width / canvas.height)), (100.0 * (canvas.width / canvas.height)), -100.0, 100.0, -100.0, 100.0);*/
 }
 
 function draw()
 {
	var modelViewMatrix=mat4.create();
	
	//***************** Translate using translate function
	//modelViewMatrix=mat4.translate(modelViewMatrix,modelViewMatrix,[-70,0,0])   //Translate
	//***********************************************************************************************
	
	//***************** Translate using matrix multiplication **************************************
	var translationMatrix = mat4.create();
	mat4.translate(translationMatrix,translationMatrix,[-1.5,0,-5]);
	modelViewMatrix=mat4.multiply(modelViewMatrix,modelViewMatrix,translationMatrix)   //Translate
	
	
	
//************************** Quads **********************
var	modelViewMatrix=mat4.create();
	modelViewMatrix=mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-2.5])  //Translate
    modelViewProjectionMatrix=mat4.create();	
	

	//mat4.rotateX(modelViewMatrix,modelViewMatrix,degreeToRadion(angleTriangle));
	//mat4.rotateY(modelViewMatrix,modelViewMatrix,degreeToRadion(angleTriangle));
	//mat4.rotateX(modelViewMatrix,modelViewMatrix,degreeToRadion(angleTriangle));
	
	gl.useProgram(shaderProgramObject);
    
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	gl.bindTexture(gl.TEXTURE_2D,quads_texture);
    gl.uniform1i(uniform_textue0_sampler, 0);
	
	gl.bindTexture(gl.TEXTURE_2D,quads_textureb);
	gl.uniform1i(uniform_textue1_sampler, 0);
	
	gl.bindTexture(gl.TEXTURE_2D,quads_texturer);
	gl.uniform1i(uniform_textue2_sampler, 0);
	gl.bindVertexArray(vao_quad);
		
		gl.drawArrays(gl.TRIANGLE_FAN,0,4);
	
    gl.bindVertexArray(null);
    
    gl.useProgram(null);

	//update();
	requestAnimationFrame(draw,canvas);
 }
 
 
  function toggleFullScreen()
 {
	 var fullscreen_element=document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement||null;
	 console.log("Current fullscreen_element value is "+fullscreen_element);
	 if(fullscreen_element==null)
	 {
		 if(canvas.requestFullscreen)
			 canvas.requestFullscreen();
		 else if(canvas.mozRequestFullScreen)
			 canvas.mozRequestFullScreen();
		 else if(canvas.webkitRequestFullscreen)
			 canvas.webkitRequestFullscreen();
		 else if(canvas.msRequestFullscreen)
			 canvas.msRequestFullscreen();
		 bFullscreen=true;
	 }else
	 {
		 if(document.exitFullscreen)
			 document.exitFullscreen()
		 else if(document.mozCancelFullScreen)
			 document.mozCancelFullScreen();
		 else if(document.webkitExitFullscreen)
			 document.webkitExitFullscreen();
		 else if(document.msExitFullscreen)
			 document.msExitFullscreen();
		 bFullscreen=false;
	 }
 }
 

 
 
  function keyDown(event)
 {
	 switch(event.keyCode)
	 {
		 case 70: //F or f
			toggleFullScreen();
			break;
	 }
 }
 
 function mouseDown()
 {
	 
 }
 
function uninitialize()
{
	
    if(vao_triangle)
    {
        gl.deleteVertexArray(vao_triangle);
        vao_triangle=null;
    }
    
    if(vbo_triangle)
    {
        gl.deleteBuffer(vbo_triangle);
        vbo_triangle=null;
    }
    
    if(shaderProgramObject)
    {
        if(fragmentShaderObject)
        {
            gl.detachShader(shaderProgramObject,fragmentShaderObject);
            gl.deleteShader(fragmentShaderObject);
            fragmentShaderObject=null;
        }
        if(vertexShaderObject)
        {
            gl.detachShader(shaderProgramObject,vertexShaderObject);
            gl.deleteShader(vertexShaderObject);
            vertexShaderObject=null;
        }        
        gl.deleteProgram(shaderProgramObject);
        shaderProgramObject=null;
    }
}

function update()
{
	if(angleTriangle<360)
	{
		angleTriangle = angleTriangle+1.0;
	}else{
		angleTriangle=0.0;
	}
}

function degreeToRadion(degree)
{
	return degree * Math.PI/180;
}

/* mat4.rotateX(targetMatrix, sourceMatrix, angleInRadion);, mat4.rotateY();, mat4.rotateZ();   */