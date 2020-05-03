/* global webots: false */

var view = null;
var ipInput = null;
var portInput = null;
var connectButton = null;
var sessionSocket = null;
var simulationSocket = null;
var streamingSocket = null;


var mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (mobileDevice) {
  var head = document.getElementsByTagName('head')[0];
  var jqueryTouch = document.createElement('script');
  jqueryTouch.setAttribute('type', 'text/javascript');
  jqueryTouch.setAttribute('src', 'https://www.cyberbotics.com/jquery-ui/1.11.4/jquery.ui.touch-punch.min.js');
  head.appendChild(jqueryTouch);

  var mobileCss = document.createElement('link');
  mobileCss.setAttribute('rel', 'stylesheet');
  mobileCss.setAttribute('type', 'text/css');
  mobileCss.setAttribute('href', 'https://www.cyberbotics.com/wwi/R2020a/wwi_mobile.css');
  head.appendChild(mobileCss);
}

function init() {
  ipInput = document.getElementById('IPInput');
  portInput = document.getElementById('PortInput');
  connectButton = document.getElementById('ConnectButton');
  $('body').layout({
    center__maskContents: true,
    south__size: 128,
    north__resizable: false
  });
}

function connect(url) {
  var playerDiv = document.getElementById('playerDiv');
  view = new webots.View(playerDiv, mobileDevice);
  view.broadcast = false;
  view.open(url);
  
  view.startOnLoad = true;
  connectButton.value = 'Disconnect';
  connectButton.onclick = disconnect;
  ipInput.disabled = true;
  portInput.disabled = true;
  
  //streamingSocket = new WebSocket(url);
  //streamingSocket.onmessage = function(message){
	//console.log(message);  
	  
  //}
  
}

function disconnect() {
  view.close();
  view = null;
  var playerDiv = document.getElementById('playerDiv');
  playerDiv.innerHTML = null;
  connectButton.value = 'Connect';
  connectButton.onclick = connect;
  ipInput.disabled = false;
  portInput.disabled = false;
  
  //streamingSocket.close();
  simulationSocket.close();
  sessionSocket.close();
  
}

var info = {
	init: {
		host: "http://file:///C:/Users/FTCAdmin/Documents/ftc_client_website/index.html",
		app: "C:/Users/FTCAdmin/AppData/Local/Programs/Webots/projects/ftc_sim", 
		world: "C:/Users/FTCAdmin/AppData/Local/Programs/Webots/projects/ftc_sim/worlds/ftc_field.wbt",
		user1Id: 1,
		user1Name: "alec",
		user1Authentication: 0,
		user2Id: 2,
		user2Name: "moo",
		customData: "hi"
	}
}

function startSim(simServerURL){
	document.getElementById('simulationInfo').innerHTML = "Simulation server at " + simServerURL;
	simulationSocket = new WebSocket(simServerURL+"/client");
	simulationSocket.onopen = function(message){
		console.log(message);
		simulationSocket.send(JSON.stringify(info));
	}
	
	simulationSocket.onmessage = function (message){
		document.getElementById('streamingInfo').innerHTML = message.data;
		//connectButton.onclick = connect;
		connect(message.data.substring(7));
	}
}


function requestSim() {
	sessionSocket = new WebSocket("ws://"+ipInput.value + ":" + portInput.value);
	sessionSocket.onmessage = function(message) {
		if (message.data == 1) {
			console.log('server available');
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
				   startSim(xhttp.responseText);
				}
				
			};
			xhttp.open("GET", 'http://' + ipInput.value + ':' + portInput.value + "/session", true);
			xhttp.send();
			
		}
	}
	sessionSocket.onopen = function(message) {
		document.getElementById('sessionInfo').innerHTML = "Session server at ws://"+ipInput.value + ":" + portInput.value
		
	}
}

window.addEventListener('load', init, false);
