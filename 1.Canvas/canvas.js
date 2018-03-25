function main()
{
	var canvas=document.getElementById("VVZ");
	if(!canvas)
			console.log("Unable to obtain canvas");
	else
			console.log("Successfully obtained canvas");
		
	console.log("Canvas width - "+canvas.width+" , Canvas height - "+canvas.height);
	
	var context = canvas.getContext("2d");
	if(!context)
			console.log("Unable to obtain context");
	else
			console.log("Successfully obtained context");
		
	context.fillStyle = "black" //"#000000"
	context.fillRect(0,0,canvas.width,canvas.height);
	
	var text = "Hello World !!!";
	
	context.textAlign = "center";
	context.textBaseline="middle";
	
	context.font="48px sans-serif";
	
	context.fillStyle = "#ffffff"; //"white"
	
	context.fillText(text,canvas.width/2,canvas.height/2);
}