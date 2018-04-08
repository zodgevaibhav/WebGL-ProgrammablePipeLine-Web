 var canvas=null;
 var context = null;
 
 function main()
 {
	 canvas = document.getElementById("AMC");
	 if(!canvas)
		 console.log("Obtaining canvas failed...\n");
	 else
		 console.log("Canvas obtained successufully...\n");
	 console.log("Canvas width = "+canvas.width+" Canvas height = "+canvas.height +"\n");
	 
	 context = canvas.getContext("2d");
	 
	 if(!context)
		console.log("Context obtained failed... \n");
	else
		console.log("Context obtained successufully... \n");
	
	context.fillStyle="black";
	context.fillRect(0,0,canvas.width,canvas.height);
	
	drawText("Hellow world !!!");
	
	window.addEventListener("keydown",keyDown,false);
	window.addEventListener("click",mouseDown,false);
 }
 
 function drawText(text)
 {
	 context.textAlign = "center";
	 context.textBaseLine="middle";
	 
	 context.font="48px sans-serif";
	 
	 context.fillStyle="white";
	 
	 context.fillText(text,canvas.width/2,canvas.height/2);
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
	 }
 }
 
 function keyDown(event)
 {
	 switch(event.keyCode)
	 {
		 case 70: //F or f
			toggleFullScreen();
			drawText("Hellow world !!!")
			break;
	 }
 }
 
 function mouseDown()
 {
	 
 }