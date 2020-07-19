// The buttons to start & stop stream and to capture the image
var btnStart = document.getElementById("btn-start");
var btnStop = document.getElementById("btn-stop");
var btnCapture = document.getElementById("btn-capture");

// The stream & capture
var stream = document.getElementById("stream");
var capture = document.getElementById("capture");
var snapshot = document.getElementById("snapshot");
var getCroppedImage = document.getElementById("getCropped");
var getCroppedOCRImage = document.getElementById("getCroppedOCR");

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
        $("#capture").cropper();

    }
}

getCroppedImage.addEventListener("click", getSnapshotImg);
getCroppedOCRImage.addEventListener("click", getConsumption);

let barcodeBase64string;
let oCRbase64string;
function getSnapshotImg() {
    $("#capture").cropper('getCroppedCanvas').toBlob(function (blob) {

        var reader = new FileReader();
        reader.readAsDataURL(blob)
        reader.onload = function () {
            barcodeBase64string = reader.result; 
            barcodeBase64string.substr(barcodeBase64string.indexOf(', ') + 1);
        }
    })
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

function take_snapshot() {
  
        Webcam.snap(function (data_uri) {
            meterConsumption = data_uri
            document.getElementById('results').src = data_uri
        });
    Webcam.reset();
    $("#results").cropper();

}

function getConsumption() {
    $("#results").cropper('getCroppedCanvas').toBlob(function (blob) {

        var readerOCR = new FileReader();
        readerOCR.readAsDataURL(blob)
        readerOCR.onload = function () {
            oCRbase64string = readerOCR.result;
            oCRbase64string.substr(oCRbase64string.indexOf(', ') + 1);
        }
    })
}

$("#save").click(function () {
    $(".errMsg").empty();
    $(".succMsg").empty();
    let formData = new FormData();
  //  formData.append("EnergyConsumptionOcrBase64", meterConsumption)
    formData.append("EnergyConsumptionOcrBase64", barcodeBase64string)
    formData.append("MeterNumberBarcodeBase64", oCRbase64string)
    formData.append("OCREngine", "2")
 

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