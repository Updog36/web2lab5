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
getLinksFromCache();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceWorker.js');
}

// push notification
Notification.requestPermission(function(status) {
	console.log('Notification permission status:', status);
});

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
	var request = indexedDB.open('audioDB', 1);
	
	request.onerror = function(event) {
		console.log('error: ');
	};

	request.onupgradeneeded = function(event) {
		var db = event.target.result;
		console.log("ObjectStore created");
		var objectStore = db.createObjectStore("audio", {keyPath: "id"});

		objectStore.createIndex("id", "id", { unique: false, autoIncrement: true });
		objectStore.createIndex("blob", "blob", { unique: false });
		objectStore.createIndex("timestamp", "timestamp", { unique: false });
	}

	request.onsuccess = function(event) {
		var db = event.target.result;
		var transaction = db.transaction(['audio'], 'readwrite');
		var objectStore = transaction.objectStore('audio');
		var request = objectStore.add({id: filename, blob: blob, timestamp: filename});
		request.onsuccess = function(event) {
			console.log('request success');
		};
		transaction.oncomplete = function(event) {
			console.log('transaction complete');
		};
		db.close();
	}

	// push notification
	if (Notification.permission == 'granted') {
		navigator.serviceWorker.getRegistration().then(function(reg) {
			var options = {
				body: 'New audio file saved',
				icon: 'icons/microphone-342(128).png',
				vibrate: [100, 50, 100],
				data: {
					dateOfArrival: Date.now(),
					primaryKey: 1
				},
				actions: [
					{action: 'explore', title: 'Open App',
						icon: 'icons/microphone-342(128).png'},
					{action: 'close', title: 'Close notification',
						icon: 'icons/microphone-342(128).png'},
				]
			};
			reg.showNotification('New audio file saved', options);
		});
	}
};

function getLinksFromCache() {
	// get blobs from indexedDB
	// check if indexedDB exists, if not don't do anything, if yes get blobs
	var request = indexedDB.open('audioDB', 1);
	request.onerror = function(event) {
		console.log('error: ');
	};
	
	request.onupgradeneeded = function(event) {
		var db = event.target.result;
		console.log("ObjectStore created");
		var objectStore = db.createObjectStore("audio", {keyPath: "id"});

		objectStore.createIndex("id", "id", { unique: false, autoIncrement: true });
		objectStore.createIndex("blob", "blob", { unique: false });
		objectStore.createIndex("timestamp", "timestamp", { unique: false });
	}

	request.onsuccess = function(event) {
		var db = event.target.result;
		var transaction = db.transaction(['audio'], 'readonly');
		var objectStore = transaction.objectStore('audio');
		var request = objectStore.getAll();
		request.onsuccess = function(event) {
			var blobs = event.target.result;
			for (var i = 0; i < blobs.length; i++) {
				var url = URL.createObjectURL(blobs[i].blob);
				var au = document.createElement('audio');
				var li = document.createElement('li');
				var link = document.createElement('a');
				au.controls = true;
				au.src = url;	
				link.href = url;
				link.download = blobs[i].id+".wav";
				link.innerHTML = "Save to disk";
				li.appendChild(au);
				li.appendChild(document.createTextNode(blobs[i].id+".wav "))
				li.appendChild(link);
				recordingsList.appendChild(li);
			}
		};
		db.close();
	}
}