// The buttons to start & stop stream and to capture the image
var btnStart = document.getElementById("btn-start");
var btnStop = document.getElementById("btn-stop");
var btnCapture = document.getElementById("btn-capture");

// The stream & capture
var stream = document.getElementById("stream");
var capture = document.getElementById("capture");
var snapshot = document.getElementById("snapshot");

// The video stream
var cameraStream = null;

// Attach listeners
btnStart.addEventListener("click", // Start Streaming
    function startStreaming() {

        var mediaSupport = 'mediaDevices' in navigator;

        if (mediaSupport && null == cameraStream) {

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (mediaStream) {

                    cameraStream = mediaStream;

                    stream.srcObject = mediaStream;

                    stream.play();
                })
                .catch(function (err) {

                    console.log("Unable to access camera: " + err);
                });
        }
        else {

            alert('Your browser does not support media devices.');

            return;
        }
    });
btnStop.addEventListener("click", stopStreaming);
// Stop Streaming
function stopStreaming() {

    if (null != cameraStream) {

        var track = cameraStream.getTracks()[0];

        track.stop();
        stream.load();

        cameraStream = null;
    }
}
btnCapture.addEventListener("click", captureSnapshot);

function captureSnapshot() {

    if (null != cameraStream) {

        var ctx = capture.getContext('2d');
        var img = new Image();

        ctx.drawImage(stream, 0, 0, capture.width, capture.height);

        img.src = capture.toDataURL("image/png");
       // img.width = 240;
        img.width = 320;
        img.height = 240

        snapshot.innerHTML = '';

        snapshot.appendChild(img);
    }
}
let barcode;
function dataURItoBlob(dataURI) {
    //console.log("top",dataURI);
    barcode = dataURI;
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var buffer = new ArrayBuffer(byteString.length);
    var data = new DataView(buffer);

    for (var i = 0; i < byteString.length; i++) {

        data.setUint8(i, byteString.charCodeAt(i));
    }

    return new Blob([buffer], { type: mimeString });
}


/*For capturing meter Consumption */
let showCamera = false;
function displayCameraForEnergyConsuptionCapture() {
    showCamera = true;
    showCameraNow()
}

var my_camera = document.getElementById('my_camera')

function showCameraNow() {
    if (showCamera === true) {
        Webcam.set({
            width: 320,
            height: 240,
            image_format: 'jpeg',
            jpeg_quality: 90
        });
        Webcam.attach(my_camera);
    }
}

let meterConsumption;

//< !--Code to handle taking the snapshot and displaying it locally-- >
function take_snapshot() {
  
        Webcam.snap(function (data_uri) {
            meterConsumption = data_uri
            document.getElementById('results').src = data_uri
        });
        Webcam.reset();
           
}




$("#save").click(function () {
    var dataURI = snapshot.firstChild.getAttribute("src");
    var imageData = dataURItoBlob(dataURI);
   //console.log("tail", barcode)
    let formData = new FormData();
    formData.append("ImageBase64", meterConsumption)
    formData.append("Barcode", barcode)
   // console.log(formData.get("ImageBase64"));
   // formData.append("MeterNumber", getMeterNumber.split(':')[1])
   // formData.append("OCREngine", "2")

    fetch('https://localhost:44311/api/Readings/AddReadings', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(response => {
            $(".succMsg").append(response);
        })
        .catch(error => {
            console.log(error)
            $(".errMsg").append(error)
            getMeterNumber = null
            // console.log(error)
        });
})