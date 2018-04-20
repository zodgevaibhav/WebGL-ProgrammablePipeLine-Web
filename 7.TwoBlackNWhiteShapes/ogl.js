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

var vao_triangle;
var vbo_triangle;

var vao_quad;
var vbo_quad;


var mvpUniform;

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
    "uniform mat4 u_mvp_matrix;"+
    "void main(void)"+
    "{"+
    "gl_Position = u_mvp_matrix * vPosition;"+
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
    "out vec4 FragColor;"+
    "void main(void)"+
    "{"+
        "FragColor = vec4(1.0,1.0,1.0,1.0);"+
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
	gl.bindAttribLocation(shaderProgramObject,WebGLMacros.VDG_ATTRIBUTE_VERTEX,"vPosition");
	
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
		mvpUniform=gl.getUniformLocation(shaderProgramObject,"u_mvp_matrix");
		
		
	//************************* Triangle Vertices ***********************
	var triangleVertices=new Float32Array([
                                           0.0,  50.0, 0.0,   
                                           -50.0, -50.0, 0.0, 
                                           50.0, -50.0, 0.0
                                           ]);
	vao_triangle=gl.createVertexArray();
    gl.bindVertexArray(vao_triangle);
    
    vbo_triangle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo_triangle);
    gl.bufferData(gl.ARRAY_BUFFER,triangleVertices,gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.VVZ_ATTRIBUTE_VERTEX,
                           3, // 3 indicates that array has 3 vertices
                           gl.FLOAT, //data type of the data in vertices
                           false, //is this data normalized (if data is normalized then it must be in range of [0.0,1.0] or [-1.0,1.0]
						   0, // do we want to stride (hops)
						   0); // from where to start reading the vertices, we want it to be read from 0

	gl.enableVertexAttribArray(WebGLMacros.VVZ_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindVertexArray(null);
	
//************************* Quads Vertices ***********************
	var quadsVertices=new Float32Array([
                                           50.0, 50.0, 0.0, 
										   -50.0, 50.0, 0.0, 
                                           -50.0, -50.0, 0.0,
										   50.0, -50.0, 0.0, 
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
	
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindVertexArray(null);
	
	gl.clearColor(0.0,0.0,0.0,1.0);
	
	orthographicProjectionMatrix=mat4.create();
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
	 
	 if (canvas.width <= canvas.height)
        mat4.ortho(orthographicProjectionMatrix, -100.0, 100.0, (-100.0 * (canvas.height / canvas.width)), (100.0 * (canvas.height / canvas.width)), -100.0, 100.0);
	 else
        mat4.ortho(orthographicProjectionMatrix, (-100.0 * (canvas.width / canvas.height)), (100.0 * (canvas.width / canvas.height)), -100.0, 100.0, -100.0, 100.0);
 }
 
 function draw()
 {
	var modelViewMatrix=mat4.create();
	modelViewMatrix=mat4.translate(modelViewMatrix,modelViewMatrix,[-70,0,0])
    var modelViewProjectionMatrix=mat4.create();	
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	 
	gl.useProgram(shaderProgramObject);
    
	mat4.multiply(modelViewProjectionMatrix,orthographicProjectionMatrix,modelViewMatrix);
	
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	gl.bindVertexArray(vao_triangle);
   
	gl.drawArrays(gl.TRIANGLES,0,3);
   
    gl.bindVertexArray(null);
	
	
//************************** Quads **********************
	modelViewMatrix=mat4.create();
	modelViewMatrix=mat4.translate(modelViewMatrix,modelViewMatrix,[70,0,0])
    modelViewProjectionMatrix=mat4.create();	
	 
	gl.useProgram(shaderProgramObject);
    
	mat4.multiply(modelViewProjectionMatrix,orthographicProjectionMatrix,modelViewMatrix);
	
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	
	
	
	gl.bindVertexArray(vao_quad);
   
   
   
	gl.drawArrays(gl.TRIANGLE_FAN,0,4);
   
    gl.bindVertexArray(null);
    
    gl.useProgram(null);
	
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
	
    if(vao)
    {
        gl.deleteVertexArray(vao);
        vao=null;
    }
    
    if(vbo)
    {
        gl.deleteBuffer(vbo);
        vbo=null;
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
