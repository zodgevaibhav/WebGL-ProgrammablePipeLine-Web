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
var light_specular=[1.0,1.0,1.0];

var light_diffuse=[1.0,0.0,0.0];
var light_position=[100.0,100.0,100.0,1.0];

var material_ambient= [0.0,0.0,0.0];
var material_diffuse= [1.0,1.0,1.0];
var material_specular= [1.0,1.0,1.0];
var material_shininess= 50.0;


var s1_ambient_material = [ 0.0215, 0.1745, 0.0215];
var s1_difuse_material = [ 0.07568, 0.61424, 0.07568];
var s1_specular_material = [ 0.633, 0.727811, 0.633];
var s1_shininess =  0.6 * 128.0 ;

var s2_ambient_material = [ 0.135, 0.2225, 0.1575];
var s2_difuse_material = [ 0.54, 0.89, 0.63];
var s2_specular_material = [ 0.316228, 0.316228, 0.316228];
var s2_shininess=0.1 * 128.0 ;

var s3_ambient_material = [ 0.05375, 0.05, 0.06625];
var s3_difuse_material = [ 0.18275, 0.17, 0.22525];
var s3_specular_material = [ 0.332741, 0.328634, 0.346435];
var s3_shininess =  0.3 * 128.0;

var s4_ambient_material = [ 0.25, 0.20725, 0.20725];
var s4_difuse_material = [ 1.0, 0.829, 0.829];
var s4_specular_material = [ 0.296648, 0.296648, 0.296648];
var s4_shininess = 0.088 * 128.0 ;

var s5_ambient_material = [ 0.1745, 0.01175, 0.01175];
var s5_difuse_material = [ 0.61424, 0.04136, 0.04136];
var s5_specular_material = [ 0.727811, 0.626959, 0.626959];
var s5_shininess = 0.6 * 128.0 ;

var s6_ambient_material = [ 0.1, 0.18725, 0.1745];
var s6_difuse_material = [ 0.396, 0.74151, 0.69102];
var s6_specular_material = [ 0.297254, 0.30829, 0.306678];
var s6_shininess = 0.1 * 128.0 ;

var s7_ambient_material = [ 0.329412, 0.223529, 0.027451];
var s7_difuse_material = [ 0.780392, 0.568627, 0.113725];
var s7_specular_material = [ 0.992157, 0.941176, 0.807843];
var s7_shininess = 0.21794872 * 128.0;

var s8_ambient_material = [ 0.2125, 0.1275, 0.054];
var s8_difuse_material = [ 0.714, 0.4284, 0.18144];
var s8_specular_material = [ 0.393548, 0.271906, 0.166721];
var s8_shininess = 0.2 * 128.0 ;

var s9_ambient_material = [ 0.25, 0.25, 0.25];
var s9_difuse_material = [ 0.4, 0.4, 0.4];
var s9_specular_material = [ 0.774597, 0.774597, 0.774597];
var s9_shininess = 0.6 * 128.0 ;

var s10_ambient_material = [ 0.19125, 0.0735, 0.0225];
var s10_difuse_material = [ 0.7038, 0.27048, 0.0828];
var s10_specular_material = [ 0.256777, 0.137622, 0.086014];
var s10_shininess = 0.1 *  128.0;

var s11_ambient_material = [ 0.24725, 0.1995, 0.0745];
var s11_difuse_material = [ 0.75164, 0.60648, 0.22648];
var s11_specular_material = [ 0.628281, 0.555802, 0.366065];
var s11_shininess = 0.4 *  128.0;

var s12_ambient_material = [ 0.19225, 0.19225, 0.19225];
var s12_difuse_material = [ 0.50754, 0.50754, 0.50754];
var s12_specular_material = [ 0.508273, 0.508273, 0.508273];
var s12_shininess = 0.4 *  128.0;

var s13_ambient_material = [ 0.0, 0.0, 0.0];
var s13_difuse_material = [ 0.01, 0.01, 0.01];
var s13_specular_material = [ 0.50, 0.50, 0.50];
var s13_shininess = 0.25 *  128.0;

var s14_ambient_material = [ 0.0, 0.1, 0.06];
var s14_difuse_material = [ 0.0, 0.50980392, 0.50980392];
var s14_specular_material = [ 0.50196078, 0.50196078, 0.50196078];
var s14_shininess = 0.25 *  128.0;

var s15_ambient_material = [ 0.0, 0.0, 0.0];
var s15_difuse_material = [ 0.1, 0.35, 0.1];
var s15_specular_material = [ 0.45, 0.55, 0.45];
var s15_shininess = 0.25 *  128.0;

var s16_ambient_material = [ 0.0, 0.0, 0.0];
var s16_difuse_material = [ 0.5, 0.0, 0.0];
var s16_specular_material = [ 0.7, 0.6, 0.6];
var s16_shininess = 0.25 *  128.0;

var s17_ambient_material = [ 0.0, 0.0, 0.0];
var s17_difuse_material = [ 0.55, 0.55, 0.55];
var s17_specular_material = [ 0.70, 0.70, 0.70];
var s17_shininess = 0.25 *  128.0;

var s18_ambient_material = [ 0.0, 0.0, 0.0];
var s18_difuse_material = [ 0.5, 0.5, 0.0];
var s18_specular_material = [ 0.60, 0.60, 0.50];
var s18_shininess = 0.25 *  128.0;

var s19_ambient_material = [ 0.02, 0.02, 0.02];
var s19_difuse_material = [ 0.01, 0.01, 0.01];
var s19_specular_material = [ 0.4, 0.4, 0.4];
var s19_shininess = 0.078125 *  128.0;

var s20_ambient_material = [ 0.0, 0.05, 0.05];
var s20_difuse_material = [ 0.4, 0.5, 0.5];
var s20_specular_material = [ 0.04, 0.7, 0.7];
var s20_shininess = 0.078125 *  128.0;

var s21_ambient_material = [ 0.0, 0.05, 0.0];
var s21_difuse_material = [ 0.4, 0.5, 0.4];
var s21_specular_material = [ 0.04, 0.7, 0.04];
var s21_shininess = 0.078125 *  128.0;

var s22_ambient_material = [ 0.05, 0.0, 0.0];
var s22_difuse_material = [ 0.5, 0.4, 0.4];
var s22_specular_material = [ 0.7, 0.04, 0.04];
var s22_shininess = 0.078125 *  128.0;

var s23_ambient_material = [ 0.05, 0.05, 0.05];
var s23_difuse_material = [ 0.5, 0.5, 0.5];
var s23_specular_material = [ 0.7, 0.7, 0.7];
var s23_shininess = 0.078125 *  128.0;

var s24_ambient_material = [ 0.05, 0.05, 0.0];
var s24_difuse_material = [ 0.5, 0.5, 0.4];
var s24_specular_material = [ 0.7, 0.7, 0.04];
var s24_shininess = 0.078125 *  128.0;

var s25_ambient_material = [ 0.05, 0.00, 0.4];
var s25_difuse_material = [ 0.4, 0.5, 0.4];
var s25_specular_material = [ 0.7, 0.7, 0.07];
var s25_shininess = 0.078125 *  128.0;

var sphere=null;

var modelMatrixUniform, viewMatrixUniform, projectionMatrixUniform;
var laUniform, ldUniform, lsUniform, lightPositionUniform;
var kaUniform, kdUniform, ksUniform, materialShininessUniform;
var LKeyPressedUniform;

var lButtonPressed=false;

var orthographicProjectionMatrix;

var angleRotateRed=0.0;
var angleRotateGreen=90.0;
var angleRotateBlue=180.0;
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
					 "uniform vec4 u_light_position;"+
					 "out vec3 transformed_normals;"+
					 "out vec3 light_direction;"+
					 "out vec3 viewer_vector;"+
					 "void main(void)"+
					 "{"+
						 "if (u_LKeyPressed == 1)"+
						 "{"+
							 "vec4 eye_coordinates=u_view_matrix * u_model_matrix * vPosition;"+
							 "transformed_normals=mat3(u_view_matrix * u_model_matrix) * vNormal;"+
							 "light_direction = vec3(u_light_position) - eye_coordinates.xyz;"+
							 "viewer_vector = -eye_coordinates.xyz;"+
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
         "in vec3 transformed_normals;"+
         "in vec3 light_direction;"+
         "in vec3 viewer_vector;"+
         "out vec4 FragColor;"+
         "uniform vec3 u_La;"+
         "uniform vec3 u_Ld;"+
		 "uniform vec3 u_Ls;"+
         "uniform vec3 u_Ka;"+
         "uniform vec3 u_Kd;"+
         "uniform vec3 u_Ks;"+
         "uniform float u_material_shininess;"+
         "uniform int u_LKeyPressed;"+
         "void main(void)"+
         "{"+
			 "vec3 phong_ads_color;"+
			 "if(u_LKeyPressed==1)"+
			 "{"+
				 "vec3 normalized_transformed_normals=normalize(transformed_normals);"+
				 "vec3 normalized_light_direction=normalize(light_direction);"+
				 "vec3 normalized_viewer_vector=normalize(viewer_vector);"+
				 "vec3 ambient = u_La * u_Ka;"+
				 "float tn_dot_ld = max(dot(normalized_transformed_normals, normalized_light_direction),0.0);"+
				 "vec3 diffuse = u_Ld * u_Kd * tn_dot_ld;"+
				 "vec3 reflection_vector = reflect(-normalized_light_direction, normalized_transformed_normals);"+
				 "vec3 specular = u_Ls * u_Ks * pow(max(dot(reflection_vector, normalized_viewer_vector), 0.0), u_material_shininess);"+
				 "phong_ads_color=ambient + diffuse + specular;"+		 
			 "}"+
			 "else"+
			 "{"+
				"phong_ads_color = vec3(1.0, 1.0, 1.0);"+
			 "}"+
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
    lsUniform=gl.getUniformLocation(shaderProgramObject,"u_Ls");
	ldUniform_red=gl.getUniformLocation(shaderProgramObject,"u_Ld");	
    lightPositionUniform_red=gl.getUniformLocation(shaderProgramObject,"u_light_position");
    
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
        
		
			 light_position[0] = angleRotateRed*100.0;
			 light_position[1]=0.0;
			 light_position[2]=angleRotateRed*100.0;
			 light_position[3]=100.0;
			 
        // setting light properties
        gl.uniform3fv(laUniform, light_ambient); // ambient intensity of light
		gl.uniform3fv(lsUniform, light_specular); // specular intensity of light
				
        gl.uniform3fv(ldUniform, light_diffuse); // diffuse intensity of light

        
		gl.uniform4fv(lightPositionUniform, light_position); // light position
        
        // setting material properties
	 
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


//*************************** 1 line ******************************************************************************
		
		gl.viewport(0, 864, canvas.width/4, canvas.height/4);        	
        
		
			gl.uniform3fv(kaUniform,s1_ambient_material);
			gl.uniform3fv(kdUniform,s1_difuse_material);
			gl.uniform3fv(ksUniform,s1_specular_material);
			gl.uniform1f(materialShininessUniform, s1_shininess);
					
		sphere.draw();
		
//-----
		
		gl.viewport(384, 864, canvas.width/4, canvas.height/4);        
		
		
		gl.uniform3fv(kaUniform,s2_ambient_material);
        gl.uniform3fv(kdUniform,s2_difuse_material);
        gl.uniform3fv(ksUniform,s2_specular_material);
        gl.uniform1f(materialShininessUniform, s2_shininess);
		       
	   sphere.draw();
	   		
		
//-----
		
		gl.viewport(768, 864, canvas.width/4, canvas.height/4);        
		
		
		gl.uniform3fv(kaUniform,s3_ambient_material);
        gl.uniform3fv(kdUniform,s3_difuse_material);
        gl.uniform3fv(ksUniform,s3_specular_material);
        gl.uniform1f(materialShininessUniform, s3_shininess);
		
        sphere.draw();		
				
//-----
				
		gl.viewport(1156, 864, canvas.width/4, canvas.height/4);        
		

		gl.uniform3fv(kaUniform,s4_ambient_material);
        gl.uniform3fv(kdUniform,s4_difuse_material);
        gl.uniform3fv(ksUniform,s4_specular_material);
		gl.uniform1f(materialShininessUniform, s4_shininess);


        sphere.draw();		
				
//-----		
		
		gl.viewport(1536, 864, canvas.width/4, canvas.height/4);        
		
		
		gl.uniform3fv(kaUniform,s5_ambient_material);
        gl.uniform3fv(kdUniform,s5_difuse_material);
        gl.uniform3fv(ksUniform,s5_specular_material);
        gl.uniform1f(materialShininessUniform, s5_shininess);


	   sphere.draw();		
		
//*************************** 2 line ******************************************************************************

		
		gl.viewport(0, 648, canvas.width/4, canvas.height/4);        
        
		
		gl.uniform3fv(kaUniform,s25_ambient_material);
        gl.uniform3fv(kdUniform,s25_difuse_material);
        gl.uniform3fv(ksUniform,s25_specular_material);		
        gl.uniform1f(materialShininessUniform, s25_shininess);        
		sphere.draw();
				
//------
		
		gl.viewport(384, 648, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s6_ambient_material);
        gl.uniform3fv(kdUniform,s6_difuse_material);
        gl.uniform3fv(ksUniform,s6_specular_material);
        gl.uniform1f(materialShininessUniform, s6_shininess);		
		sphere.draw();
				
//-------
		
		gl.viewport(768, 648, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s7_ambient_material);
        gl.uniform3fv(kdUniform,s7_difuse_material);
        gl.uniform3fv(ksUniform,s7_specular_material);		
        gl.uniform1f(materialShininessUniform, s7_shininess);		
		sphere.draw();		
		
//-------
		
		gl.viewport(1156, 648, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s8_ambient_material);
        gl.uniform3fv(kdUniform,s8_difuse_material);
        gl.uniform3fv(ksUniform,s8_specular_material);
        gl.uniform1f(materialShininessUniform, s8_shininess);		
		sphere.draw();		
		
//-------		
		
		gl.viewport(1536, 648, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s9_ambient_material);
        gl.uniform3fv(kdUniform,s9_difuse_material);
        gl.uniform3fv(ksUniform,s9_specular_material);		
        gl.uniform1f(materialShininessUniform, s9_shininess);		
		sphere.draw();		
		
//*************************** 3 line ******************************************************************************
		
		gl.viewport(0, 432, canvas.width/4, canvas.height/4);        
        

		gl.uniform3fv(kaUniform,s10_ambient_material);
        gl.uniform3fv(kdUniform,s10_difuse_material);
        gl.uniform3fv(ksUniform,s10_specular_material);
        gl.uniform1f(materialShininessUniform, s10_shininess);		
        sphere.draw();
				
//--------		
		
		gl.viewport(384, 432, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s11_ambient_material);
        gl.uniform3fv(kdUniform,s11_difuse_material);
        gl.uniform3fv(ksUniform,s11_specular_material);		
        gl.uniform1f(materialShininessUniform, s11_shininess);		
		sphere.draw();
		
//-------		
		
		gl.viewport(768, 432, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s12_ambient_material);
        gl.uniform3fv(kdUniform,s12_difuse_material);
        gl.uniform3fv(ksUniform,s12_specular_material);		
        gl.uniform1f(materialShininessUniform, s12_shininess);		
		sphere.draw();		
		
//-------
		
		gl.viewport(1156, 432, canvas.width/4, canvas.height/4);        
		
		
		gl.uniform3fv(kaUniform,s13_ambient_material);
        gl.uniform3fv(kdUniform,s13_difuse_material);
        gl.uniform3fv(ksUniform,s13_specular_material);		
        gl.uniform1f(materialShininessUniform, s13_shininess);		
        sphere.draw();		
		
//-------		
		
		gl.viewport(1536, 432, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s14_ambient_material);
        gl.uniform3fv(kdUniform,s14_difuse_material);
        gl.uniform3fv(ksUniform,s14_specular_material);		
        gl.uniform1f(materialShininessUniform, s14_shininess);		
		sphere.draw();		
		
//*************************** 4 line ******************************************************************************
		
		gl.viewport(0, 216, canvas.width/4, canvas.height/4);        
        
		
		gl.uniform3fv(kaUniform,s15_ambient_material);
        gl.uniform3fv(kdUniform,s15_difuse_material);
        gl.uniform3fv(ksUniform,s15_specular_material);		
        gl.uniform1f(materialShininessUniform, s15_shininess);		
        sphere.draw();
		
//-----		
		
		gl.viewport(384, 216, canvas.width/4, canvas.height/4);        
		
       
		gl.uniform3fv(kaUniform,s16_ambient_material);
        gl.uniform3fv(kdUniform,s16_difuse_material);
        gl.uniform3fv(ksUniform,s16_specular_material);
        gl.uniform1f(materialShininessUniform, s16_shininess);
		
		sphere.draw();
		
//------		
		
		gl.viewport(768, 216, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s17_ambient_material);
        gl.uniform3fv(kdUniform,s17_difuse_material);
        gl.uniform3fv(ksUniform,s17_specular_material);		
        gl.uniform1f(materialShininessUniform, s17_shininess);
		
		sphere.draw();		
				
//------
		
		gl.viewport(1156, 216, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s18_ambient_material);
        gl.uniform3fv(kdUniform,s18_difuse_material);
        gl.uniform3fv(ksUniform,s18_specular_material);		
        gl.uniform1f(materialShininessUniform, s18_shininess);
		
		sphere.draw();		
				
//------		
		
		gl.viewport(1536, 216, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s19_ambient_material);
        gl.uniform3fv(kdUniform,s19_difuse_material);
        gl.uniform3fv(ksUniform,s19_specular_material);		
        gl.uniform1f(materialShininessUniform, s19_shininess);		
		
		sphere.draw();		
		
//*************************** 5 line 
		
		gl.viewport(0, 0, canvas.width/4, canvas.height/4);        
        
		
		gl.uniform3fv(kaUniform,s20_ambient_material);
        gl.uniform3fv(kdUniform,s20_difuse_material);
        gl.uniform3fv(ksUniform,s20_specular_material);		
        gl.uniform1f(materialShininessUniform, s20_shininess);
		
        sphere.draw();
				
//-------		
		
		gl.viewport(384, 0, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s21_ambient_material);
        gl.uniform3fv(kdUniform,s21_difuse_material);
        gl.uniform3fv(ksUniform,s21_specular_material);
        gl.uniform1f(materialShininessUniform, s21_shininess);		
		sphere.draw();
				
//------		
		
		gl.viewport(768, 0, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s22_ambient_material);
        gl.uniform3fv(kdUniform,s22_difuse_material);
        gl.uniform3fv(ksUniform,s22_specular_material);		
        gl.uniform1f(materialShininessUniform, s22_shininess);
		
		sphere.draw();		
		
//------		
		
		gl.viewport(1156, 0, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s23_ambient_material);
        gl.uniform3fv(kdUniform,s23_difuse_material);
        gl.uniform3fv(ksUniform,s23_specular_material);		
        gl.uniform1f(materialShininessUniform, s23_shininess);
		
		sphere.draw();		
				
//------		
		
		gl.viewport(1536, 0, canvas.width/4, canvas.height/4);        
		
        
		gl.uniform3fv(kaUniform,s24_ambient_material);
        gl.uniform3fv(kdUniform,s24_difuse_material);
        gl.uniform3fv(ksUniform,s24_specular_material);		
        gl.uniform1f(materialShininessUniform, s24_shininess);
		
		sphere.draw();		

   
    gl.useProgram(null);
    
    update();
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
	angleRotateRed=angleRotateRed+0.15;
		if(angleRotateRed>360.0)
			angleRotateRed=0.0;
		
		
			angleRotateGreen=angleRotateGreen+0.15;
		if(angleRotateGreen>360.0)
			angleRotateGreen=0.0;
		
		
			angleRotateBlue=angleRotateBlue+0.15;
		if(angleRotateBlue>360.0)
			angleRotateBlue=0.0;
}

function degreeToRadion(degree)
{
	return degree * Math.PI/180;
}

/* mat4.rotateX(targetMatrix, sourceMatrix, angleInRadion);, mat4.rotateY();, mat4.rotateZ();   */