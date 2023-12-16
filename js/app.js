URL = window.URL || window.webkitURL;

var gumStream;
var rec;
var input;
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceWorker.js');
}

function startRecording() {
    var constraints = { audio: true, video:false }
	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		audioContext = new AudioContext();
		gumStream = stream;
		input = audioContext.createMediaStreamSource(stream);
		rec = new Recorder(input,{numChannels:1})
		rec.record()
	}).catch(function(err) {
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true
	});
}

function pauseRecording(){
	if (rec.recording){
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		rec.record()
		pauseButton.innerHTML="Pause";
	}
}

function stopRecording() {
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;
	pauseButton.innerHTML="Pause";
	rec.stop();
	gumStream.getAudioTracks()[0].stop();
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');
	var filename = new Date().toISOString();
	au.controls = true;
	au.src = url;
	link.href = url;
	link.download = filename+".wav";
	link.innerHTML = "Save to disk";
	li.appendChild(au);
	li.appendChild(document.createTextNode(filename+".wav "))
	li.appendChild(link);
	recordingsList.appendChild(li);
}