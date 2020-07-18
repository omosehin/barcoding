

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

let getBase64;

//< !--Code to handle taking the snapshot and displaying it locally-- >
function take_snapshot() {
  
        Webcam.snap(function (data_uri) {
            getBase64 = data_uri
            document.getElementById('results').src = data_uri
        });
        Webcam.reset();
           
}



$("#save").click(function () {
    let formData = new FormData();
   // formData.append("ImageBase64", getBase64)
    formData.append("Barcode", getBase64)
   // formData.append("MeterNumber", getMeterNumber.split(':')[1])
   // formData.append("OCREngine", "2")

    fetch('https://localhost:44311/api/Homes/GetDetails', {
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