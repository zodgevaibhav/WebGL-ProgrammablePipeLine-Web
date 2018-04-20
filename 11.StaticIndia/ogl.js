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
var vao;
var vbo;
var vbo_color;
var mvpUniform;
var perspectiveProjectionMatrix;
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
	"in vec4 vColor;"+
	"out vec4 vOutColor;"+
    "uniform mat4 u_mvp_matrix;"+
    "void main(void)"+
    "{"+
    "gl_Position = u_mvp_matrix * vPosition;"+
	"vOutColor=vColor;"+
    "}";
	vertexShaderObject=gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject,vertexShaderSourceCode);
    gl.compileShader(vertexShaderObject);
	if(gl.getShaderParameter(vertexShaderObject,gl.COMPILE_STATUS)==false)
    {
        var error=gl.getShaderInfoLog(vertexShaderObject);
        if(error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }
//*********************************************** Fragment Shader ****************************
var fragmentShaderSourceCode=
    "#version 300 es"+
    "\n"+
    "precision highp float;"+
	"in vec4 vOutColor;"+
    "out vec4 FragColor;"+
    "void main(void)"+
    "{"+
    "FragColor = vOutColor;"+//vec4(1.0, 1.0, 1.0, 1.0);"+
    "}"
    fragmentShaderObject=gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject,fragmentShaderSourceCode);
    gl.compileShader(fragmentShaderObject);
    if(gl.getShaderParameter(fragmentShaderObject,gl.COMPILE_STATUS)==false)
    {
        var error=gl.getShaderInfoLog(fragmentShaderObject);
        if(error.length > 0)
        {
            alert(error);
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
                                  //**********************************  I   ***********************************************
									-0.8, 0.9, 0.0,
									-0.8, -0.9, 0.0,
									//**********************************  N   ***********************************************
									-0.6, 0.9, 0.0,
									-0.6, -0.9, 0.0,
									-0.4, 0.9, 0.0,
									-0.4, -0.9, 0.0,
									-0.6, 0.9, 0.0,
									-0.4, -0.9, 0.0,
									//**********************************  D   ***********************************************
									-0.25, 0.9, 0.0,
									0.003, 0.9, 0.0,
									-0.2, 0.9, 0.0,
									-0.2, -0.9, 0.0,
									0.0, 0.9, 0.0,
									0.0, -0.9, 0.0,
									-0.25, -0.9, 0.0,
									0.003, -0.9, 0.0,
									//**********************************  I   ***********************************************
									0.2, 0.9, 0.0,
									0.2, -0.9, 0.0,
									//**********************************  A   ***********************************************
									0.5, 0.9, 0.0,
									0.3, -0.9, 0.0,
									0.5, 0.9, 0.0,
									0.7, -0.9, 0.0,
									//**********************************  Middle line of A   ***********************************************
									0.4, 0.03, 0.0,
									0.6, 0.03, 0.0,
									0.4, 0.02, 0.0,
									0.6, 0.02, 0.0,
									0.4, 0.01, 0.0,
									0.6, 0.01, 0.0,		
                                           ]);
	vao=gl.createVertexArray();
    gl.bindVertexArray(vao);
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,triangleVertices,gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.VVZ_ATTRIBUTE_VERTEX,
                           3, // 3 indicates that array has 3 vertices
                           gl.FLOAT, //data type of the data in vertices
                           false, //is this data normalized (if data is normalized then it must be in range of [0.0,1.0] or [-1.0,1.0]
						   0, // do we want to stride (hops)
						   0); // from where to start reading the vertices, we want it to be read from 0
	gl.enableVertexAttribArray(WebGLMacros.VDG_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindVertexArray(null);
		//gl.vertexAttrib3f(WebGLMacros.VVZ_ATTRIBUTE_COLOR,1.0,0.0,0.0);
		//gl.vertexAttrib3f(WebGLMacros.VVZ_ATTRIBUTE_COLOR,0.0,1.0,0.0);
	var indiaColor = new Float32Array(
											[
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
												1.0,0.64,0.0,
												0.0,0.99,0.0,
											]
										);
	gl.bindVertexArray(vao);
	vbo_color = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);
	gl.bufferData(gl.ARRAY_BUFFER,indiaColor,gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.VVZ_ATTRIBUTE_COLOR,
                           3, // 3 indicates that array has 3 vertices
                           gl.FLOAT, //data type of the data in vertices
                           false, //is this data normalized (if data is normalized then it must be in range of [0.0,1.0] or [-1.0,1.0]
						   0, // do we want to stride (hops)
						   0); // from where to start reading the vertices, we want it to be read from 0
	gl.enableVertexAttribArray(WebGLMacros.VVZ_ATTRIBUTE_COLOR);
    
	gl.bindBuffer(gl.ARRAY_B7UFFER,null);
    gl.bindVertexArray(null);
	
	gl.clearColor(0.0,0.0,0.0,1.0);
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
	 //mat4.perspective(perspectiveProjectionMatrix,degreeToRadion(45.0),(canvas.height / canvas.width),0.1,100.0);
	 mat4.perspective(perspectiveProjectionMatrix,degreeToRadion(45.0),canvas.width/canvas.height,0.1,100.0);
/*	 if (canvas.width <= canvas.height)
        mat4.ortho(orthographicProjectionMatrix, -100.0, 100.0, (-100.0 * (canvas.height / canvas.width)), (100.0 * (canvas.height / canvas.width)), -100.0, 100.0);
	 else
        mat4.ortho(orthographicProjectionMatrix, (-100.0 * (canvas.width / canvas.height)), (100.0 * (canvas.width / canvas.height)), -100.0, 100.0, -100.0, 100.0);*/
 }
 function draw()
 {
	var modelViewMatrix=mat4.create();
    var modelViewProjectionMatrix=mat4.create();	
	mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-2.5]);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(shaderProgramObject);
	mat4.multiply(modelViewProjectionMatrix,perspectiveProjectionMatrix,modelViewMatrix);
	gl.uniformMatrix4fv(mvpUniform,false,modelViewProjectionMatrix);
	gl.bindVertexArray(vao);
	
	gl.lineWidth(10.0);
	gl.drawArrays(gl.LINES,0,2);  //I
	
	gl.drawArrays(gl.LINES,2,6); //N
	
	gl.drawArrays(gl.LINES,8,8); //D
	
	gl.drawArrays(gl.LINES,16,2);  //I
	
	gl.drawArrays(gl.LINES,18,4);  //A
	
	gl.drawArrays(gl.LINES,22,4);  //A
   
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
function degreeToRadion(degree)
{
	return degree * Math.PI/180;
}