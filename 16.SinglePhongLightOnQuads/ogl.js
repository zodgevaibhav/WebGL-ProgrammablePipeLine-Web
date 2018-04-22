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
};

var vertexShaderObject;
var fragmentShaderObject;
var shaderProgramObject;


var vao_quad;
var vbo_quad;
var vbo_quad_normals


var angleTriangle=0.0;
var angleQuad=0.0;


var modelViewMatrixUniform, projectionMatrixUniform;
var ldUniform, kdUniform, lightPositionUniform;
var LKeyPressedUniform;

var lButtonPressed=false;

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
    "in vec3 vNormal;"+
    "uniform mat4 u_model_view_matrix;"+
    "uniform mat4 u_projection_matrix;"+
    "uniform mediump int u_LKeyPressed;"+
    "uniform vec3 u_Ld;"+
    "uniform vec3 u_Kd;"+
    "uniform vec4 u_light_position;"+
    "out vec3 diffuse_light;"+
    "void main(void)"+
    "{"+
    "if(u_LKeyPressed == 1)"+
    "{"+
    "vec4 eyeCoordinates=u_model_view_matrix * vPosition;"+
    "vec3 tnorm =  normalize(mat3(u_model_view_matrix) * vNormal);"+
    "vec3 s = normalize(vec3(u_light_position - eyeCoordinates));"+
    "diffuse_light = u_Ld * u_Kd * max( dot( s, tnorm ), 0.0 );"+
    "}"+
    "gl_Position=u_projection_matrix * u_model_view_matrix * vPosition;"+
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
    "in vec3 diffuse_light;"+
    "out vec4 FragColor;"+
    "uniform int u_LKeyPressed;"+
    "void main(void)"+
    "{"+
    "vec4 color;"+
    "if (u_LKeyPressed == 1)"+
    "{"+
    "color = vec4(diffuse_light,1.0);"+
    "}"+
    "else"+
    "{"+
    "color = vec4(1.0, 1.0, 1.0, 1.0);"+
    "}"+
    "FragColor = color;"+
    "}";
    
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
	gl.bindAttribLocation(shaderProgramObject,WebGLMacros.VVZ_ATTRIBUTE_NORMAL,"vNormal");

	
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


//********** Bind uniforms		
	modelViewMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_model_view_matrix");
    projectionMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_projection_matrix");
    
    // For l key pressed uniform
    LKeyPressedUniform=gl.getUniformLocation(shaderProgramObject,"u_LKeyPressed");
    
    ldUniform=gl.getUniformLocation(shaderProgramObject,"u_Ld");
    kdUniform=gl.getUniformLocation(shaderProgramObject,"u_Kd");
    
    lightPositionUniform=gl.getUniformLocation(shaderProgramObject,"u_light_position");		
		
	
		
//************************* Quads Vertices ***********************
	var quadsVertices=new Float32Array([
             1.0, 1.0, -1.0,  //right-top corner of top face
			-1.0, 1.0, -1.0, //left-top corner of top face
			-1.0, 1.0, 1.0, //left-bottom corner of top face
			1.0, 1.0, 1.0, //right-bottom corner of top face

			1.0, -1.0, -1.0, //right-top corner of bottom face
			-1.0, -1.0, -1.0, //left-top corner of bottom face
			-1.0, -1.0, 1.0, //left-bottom corner of bottom face
			1.0, -1.0, 1.0, //right-bottom corner of bottom face

			1.0, 1.0, 1.0, //right-top corner of front face
			-1.0, 1.0, 1.0, //left-top corner of front face
			-1.0, -1.0, 1.0, //left-bottom corner of front face
			1.0, -1.0, 1.0, //right-bottom corner of front face

			1.0, 1.0, -1.0, //right-top of back face
			-1.0, 1.0, -1.0, //left-top of back face
			-1.0, -1.0, -1.0, //left-bottom of back face
			1.0, -1.0, -1.0, //right-bottom of back face

			-1.0, 1.0, 1.0, //right-top of left face
			-1.0, 1.0, -1.0, //left-top of left face
			-1.0, -1.0, -1.0, //left-bottom of left face
			-1.0, -1.0, 1.0 ,//right-bottom of left face
	
			1.0, 1.0, -1.0, //right-top of right face
			1.0, 1.0, 1.0, //left-top of right face
			1.0, -1.0, 1.0, //left-bottom of right face
			1.0, -1.0, -1.0, //right-bottom of right face

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

		var quadsNormals = new Float32Array([
		                                                      // top
                                      0.0, 1.0, 0.0,
                                      0.0, 1.0, 0.0,
                                      0.0, 1.0, 0.0,
                                      0.0, 1.0, 0.0,
                                      
                                      // bottom
                                      0.0, -1.0, 0.0,
                                      0.0, -1.0, 0.0,
                                      0.0, -1.0, 0.0,
                                      0.0, -1.0, 0.0,
                                      
                                      // front
                                      0.0, 0.0, 1.0,
                                      0.0, 0.0, 1.0,
                                      0.0, 0.0, 1.0,
                                      0.0, 0.0, 1.0,
                                      
                                      // back
                                      0.0, 0.0, -1.0,
                                      0.0, 0.0, -1.0,
                                      0.0, 0.0, -1.0,
                                      0.0, 0.0, -1.0,
                                      
                                      // left
                                      -1.0, 0.0, 0.0,
                                      -1.0, 0.0, 0.0,
                                      -1.0, 0.0, 0.0,
                                      -1.0, 0.0, 0.0,
                                      
                                      // right
                                      1.0, 0.0, 0.0,
                                      1.0, 0.0, 0.0,
                                      1.0, 0.0, 0.0,
                                      1.0, 0.0, 0.0
                                    ]);

	gl.bindVertexArray(vao_quad);

	vbo_quad_normals = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_quad_normals);
	gl.bufferData(gl.ARRAY_BUFFER,quadsNormals,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.VVZ_ATTRIBUTE_NORMAL,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(WebGLMacros.VVZ_ATTRIBUTE_NORMAL);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindVertexArray(null);
	
	 gl.clearColor(0.0, 0.0, 0.0, 1.0); // black
    
    // Depth test will always be enabled
    gl.enable(gl.DEPTH_TEST);

    // depth test to do
    gl.depthFunc(gl.LEQUAL);
    
    // We will always cull back faces for better performance
//    gl.enable(gl.CULL_FACE);

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
	 	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(shaderProgramObject);

	 
	 if(lButtonPressed==true)
	 {
		 gl.uniform1i(LKeyPressedUniform, 1); // send 1 to shader as uniform
		 gl.uniform3f(ldUniform, 1.0, 1.0, 1.0); //diffuse property of light
		 gl.uniform3f(kdUniform, 0.5, 0.5, 0.5); // diffuse reflectivity of material
		 var lightPosition = [0.0, 0.0, 2.0, 1.0];
         gl.uniform4fv(lightPositionUniform, lightPosition); // light position
	 }else{
		 gl.uniform1i(LKeyPressedUniform, 0);
	 }
	 
	var modelViewMatrix=mat4.create();
	
	//***************** Translate using translate function
	//modelViewMatrix=mat4.translate(modelViewMatrix,modelViewMatrix,[-70,0,0])   //Translate
	//***********************************************************************************************
	
	//***************** Translate using matrix multiplication **************************************
	var translationMatrix = mat4.create();

	var modelViewMatrix=mat4.create(); // itself creates identity matrix
	modelViewMatrix=mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-4.0])  //Translate
    modelViewProjectionMatrix=mat4.create();	
	

	mat4.rotateX(modelViewMatrix,modelViewMatrix,degreeToRadion(angleTriangle));
	mat4.rotateY(modelViewMatrix,modelViewMatrix,degreeToRadion(angleTriangle));
	mat4.rotateX(modelViewMatrix,modelViewMatrix,degreeToRadion(angleTriangle));
	
    
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	
	gl.uniformMatrix4fv(modelViewMatrixUniform,false,modelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);

	
	gl.bindVertexArray(vao_quad);
		
		gl.drawArrays(gl.TRIANGLE_FAN,0,4);
		gl.drawArrays(gl.TRIANGLE_FAN,4,4);
		gl.drawArrays(gl.TRIANGLE_FAN,8,4);
		gl.drawArrays(gl.TRIANGLE_FAN,12,4);
		gl.drawArrays(gl.TRIANGLE_FAN,16,4);
		gl.drawArrays(gl.TRIANGLE_FAN,20,4);
   
    gl.bindVertexArray(null);
    
    gl.useProgram(null);

	update();
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
        case 76: // for 'L' or 'l'
            if(lButtonPressed==false)
                lButtonPressed=true;
            else
                lButtonPressed=false;
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