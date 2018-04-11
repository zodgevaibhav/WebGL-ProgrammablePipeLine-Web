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
	
	gl.clearColor(0.0,0.0,1.0,1.0);
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
 }
 
 function draw()
 {
	 gl.clear(gl.COLOR_BUFFER_BIT);
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