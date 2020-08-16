// The buttons to start & stop stream and to capture the image
var btnStart = document.getElementById("btn-start");
var btnStop = document.getElementById("btn-stop");
var btnCapture = document.getElementById("btn-capture");

// The stream & capture
var stream = document.getElementById("stream");
var capture = document.getElementById("capture");
var snapshot = document.getElementById("snapshot");
var getCroppedBarcodeImage = document.getElementById("getCroppedBarcode");
var getCroppedOCRImage = document.getElementById("getCroppedOCR");
getLocation();

$("#save").prop("disabled", "disabled");
$("#btn-capture").prop("disabled", "disabled");
$("#OCR-capture").prop("disabled", "disabled");

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
};

// The video stream
var cameraStream = null;

// Attach listeners
btnStart.addEventListener("click", // Start Streaming
    function startStreaming() {
        $("#btn-capture").removeAttr('disabled');


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

getCroppedBarcodeImage.addEventListener("click", getSnapshotImg);
getCroppedOCRImage.addEventListener("click", getConsumption);

let barcodeBase64string;
let oCRbase64string;
function getSnapshotImg() {
    $("#capture").cropper('getCroppedCanvas').toBlob(function (blob) {
        $("#save").removeAttr('disabled');

        var reader = new FileReader();
        reader.readAsDataURL(blob)
        reader.onload = function () {
            barcodeBase64string = reader.result; 
            barcodeBase64string.substr(barcodeBase64string.indexOf(', ') + 1);
        }
    })
    $.ambiance({
        message: "Image Cropped,Close", title: "Success!",
        type: "success"
    });
}


/*For capturing meter Consumption */
let showCamera = false;
function displayCameraForEnergyConsumptionCapture() {
   // document.getElementById('results').val("");
    showCamera = true;
    showCameraNow()
}

var my_camera = document.getElementById('my_camera')

function showCameraNow() {
    $("#OCR-capture").removeAttr('disabled');
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

//let meterConsumption;

function take_snapshot() {
  
        Webcam.snap(function (data_uri) {
           // meterConsumption = data_uri
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

    $.ambiance({
        message: "Image Cropped,close and snap barcode", timeout: 5, title: "Success!",
        type: "success"
    });
}
let lat;
let long;
function showPosition(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
}


    

function getData() {
    $(".errMsg").empty();
    $(".succMsg").empty();
    let formData = new FormData();
    //  formData.append("EnergyConsumptionOcrBase64", meterConsumption)
    if (typeof oCRbase64string == "undefined") {
        $.ambiance({ message: "Meter Consumption was not well captured", type: "error", });
        $("#save").prop("disabled", "disabled");
        throw new Error("Image not well captured !");
    }
    else if (typeof barcodeBase64string == "undefined") {
        $.ambiance({ message: "Barcode was not well captured", type: "error", });
        $("#save").prop("disabled", "disabled");
        throw new Error("Image not well captured !");
    }
    else {
        formData.append("EnergyConsumptionOcrBase64", oCRbase64string)
        formData.append("MeterNumberBarcodeBase64", barcodeBase64string)
        formData.append("Latitude", lat)
        formData.append("Longitude", long)
        formData.append("OCREngine", "2")
        return formData
    }
}

$("#save").click(function () {
    var formdatum = getData();
    fetch('https://localhost:44311/api/Readings/AddReadings', {
        method: 'POST',
        body: formdatum
    })
        .then(response => response.json())
        .then(response => {
          //  $(".succMsg").append(response);
            $.ambiance({
                message: response, title: "Success!",
                type: "success" });

            $("#save").prop("disabled", "disabled");
            $("#btn-capture").prop("disabled", "disabled");
            $("#OCR-capture").prop("disabled", "disabled");
        })
        .catch(error => {
          //  console.log(error)
          //  $(".errMsg").append(error)
            $.ambiance({
                message: error,
                type: "error"
            });
            getMeterNumber = null
            $("#save").prop("disabled", "disabled");
            $("#btn-capture").prop("disabled", "disabled");
            $("#OCR-capture").prop("disabled", "disabled");
            // console.log(error)
        });
    $("#btn-capture").prop("disabled", "disabled");
    $("#OCR-capture").prop("disabled", "disabled");
})