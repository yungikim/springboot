<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Voice to Text Converter</title>
</head>
<body>
	<div id = "result" ></div><br>
	<button id="start">Start</button>
	<button id="stop">Stop</button>
	
	<script>
		var startButton = document.getElementById("start");
		var stopButton = document.getElementById("stop");
		var resultElement = document.getElementById("result");
		var stop_click = false;
		
		var recognition = new webkitSpeechRecognition();
		recognition.lang = window.navigator.language;
		recognition.interimResults = false;
		recognition.continuous = true;
		
		startButton.addEventListener('click', () => {recognition.start();});
		stopButton.addEventListener('click', () => {recognition.stop(); stop_click=true});
		
		recognition.addEventListener('result', (event) =>{
			const result = event.results[event.results.length - 1][0].transcript;
			resultElement.innerHTML = result;
			

		});
		
		recognition.addEventListener("end", () => {
			  console.log("Speech recognition service disconnected");
			  if (!stop_click){
					setTimeout(function(){
						recognition.start();
					}, 1000)
			  }
			  stop_click = false;

			});
		
	</script>

</body>
</html>