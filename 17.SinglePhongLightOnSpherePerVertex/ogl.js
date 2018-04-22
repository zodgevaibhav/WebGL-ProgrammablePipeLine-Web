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


var light_ambient=[0.0,0.0,0.0];
var light_diffuse=[1.0,1.0,1.0];
var light_specular=[1.0,1.0,1.0];
var light_position=[100.0,100.0,100.0,1.0];

var material_ambient= [0.0,0.0,0.0];
var material_diffuse= [1.0,1.0,1.0];
var material_specular= [1.0,1.0,1.0];
var material_shininess= 50.0;

var sphere=null;

var modelMatrixUniform, viewMatrixUniform, projectionMatrixUniform;
var laUniform, ldUniform, lsUniform, lightPositionUniform;
var kaUniform, kdUniform, ksUniform, materialShininessUniform;
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
		"uniform mat4 u_model_matrix;"+
		"uniform mat4 u_view_matrix;"+
		"uniform mat4 u_projection_matrix;"+
		"uniform mediump int u_LKeyPressed;"+
		"uniform vec3 u_La;"+
		"uniform vec3 u_Ld;"+
		"uniform vec3 u_Ls;"+
		"uniform vec4 u_light_position;"+
		"uniform vec3 u_Ka;"+
		"uniform vec3 u_Kd;"+
		"uniform vec3 u_Ks;"+
		"uniform float u_material_shininess;"+
		"out vec3 phong_ads_color;"+
		"void main(void)"+
		"{"+
		"if(u_LKeyPressed == 1)"+
		"{"+
		"vec4 eye_coordinates=u_view_matrix * u_model_matrix * vPosition;"+
		"vec3 transformed_normals=normalize(mat3(u_view_matrix * u_model_matrix) * vNormal);"+
		"vec3 light_direction = normalize(vec3(u_light_position) - eye_coordinates.xyz);"+
		"float tn_dot_ld = max(dot(transformed_normals, light_direction),0.0);"+
		"vec3 ambient = u_La * u_Ka;"+
		"vec3 diffuse = u_Ld * u_Kd * tn_dot_ld;"+
		"vec3 reflection_vector = reflect(-light_direction, transformed_normals);"+
		"vec3 viewer_vector = normalize(-eye_coordinates.xyz);"+
		"vec3 specular = u_Ls * u_Ks * pow(max(dot(reflection_vector, viewer_vector), 0.0), u_material_shininess);"+
		"phong_ads_color=ambient + diffuse + specular;"+
		"}"+
		"else"+
		"{"+
		"phong_ads_color = vec3(1.0, 1.0, 1.0);"+
		"}"+
		"gl_Position=u_projection_matrix * u_view_matrix * u_model_matrix * vPosition;"+
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
    "in vec3 phong_ads_color;"+
    "out vec4 FragColor;"+
    "void main(void)"+
    "{"+
    "FragColor = vec4(phong_ads_color, 1.0);"+
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
    modelMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_model_matrix");
    viewMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_view_matrix");
    projectionMatrixUniform=gl.getUniformLocation(shaderProgramObject,"u_projection_matrix");
    

    LKeyPressedUniform=gl.getUniformLocation(shaderProgramObject,"u_LKeyPressed");
    
    // Light properties
    laUniform=gl.getUniformLocation(shaderProgramObject,"u_La");
    ldUniform=gl.getUniformLocation(shaderProgramObject,"u_Ld");
    lsUniform=gl.getUniformLocation(shaderProgramObject,"u_Ls");
    lightPositionUniform=gl.getUniformLocation(shaderProgramObject,"u_light_position");
    
    // Material properties
    kaUniform=gl.getUniformLocation(shaderProgramObject,"u_Ka");
    kdUniform=gl.getUniformLocation(shaderProgramObject,"u_Kd");
    ksUniform=gl.getUniformLocation(shaderProgramObject,"u_Ks");
    materialShininessUniform=gl.getUniformLocation(shaderProgramObject,"u_material_shininess");
    
    // Create sphere 
    sphere=new Mesh();
    makeSphere(sphere,2.0,30,30);
	
	 gl.clearColor(0.0, 0.0, 0.0, 1.0); // black
	 gl.enable(gl.DEPTH_TEST);
	 gl.depthFunc(gl.LEQUAL);
    
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
    // code
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(shaderProgramObject);
    
    if(lButtonPressed==true)
    {
        gl.uniform1i(LKeyPressedUniform, 1);
        
        // setting light properties
        gl.uniform3fv(laUniform, light_ambient); // ambient intensity of light
        gl.uniform3fv(ldUniform, light_diffuse); // diffuse intensity of light
        gl.uniform3fv(lsUniform, light_specular); // specular intensity of light
        gl.uniform4fv(lightPositionUniform, light_position); // light position
        
        // setting material properties
        gl.uniform3fv(kaUniform, material_ambient); // ambient reflectivity of material
        gl.uniform3fv(kdUniform, material_diffuse); // diffuse reflectivity of material
        gl.uniform3fv(ksUniform, material_specular); // specular reflectivity of material
        gl.uniform1f(materialShininessUniform, material_shininess); // material shininess
    }
    else
    {
        gl.uniform1i(LKeyPressedUniform, 0);
    }
    
    var modelMatrix=mat4.create();
    var viewMatrix=mat4.create();

    mat4.translate(modelMatrix, modelMatrix, [0.0,0.0,-6.0]);
    
    gl.uniformMatrix4fv(modelMatrixUniform,false,modelMatrix);
    gl.uniformMatrix4fv(viewMatrixUniform,false,viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniform,false,perspectiveProjectionMatrix);
    
    sphere.draw();
   
    gl.useProgram(null);
    
    // animation loop
    requestAnimationFrame(draw, canvas);
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