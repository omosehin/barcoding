
let barcode;
function displayCameraForEnergyConsuptionCapture1() {
    // showCamera = true;
    showCameraNow1()
}

var my_camera = document.getElementById('my_camera')
//< !--Code to handle taking the snapshot and displaying it locally-- >
function take_snapshot1() {
    Webcam.snap(function (data_uri) {

        barcode = data_uri
        document.getElementById('results1').src = data_uri
    });
    Webcam.reset();
    //if (getMeterNumber != null) {
    //    $("#save").removeClass('hidden')
    //}       
}

/*2nd*/
/*For capturing meter Consumption */
let showCamera = false;
let getBase64;
function displayCameraForEnergyConsuptionCapture() {
    showCamera = true;
    showCameraNow()
}

var my_camera = document.getElementById('my_camera')

function showCameraNow() {
    // if (showCamera === true) {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90
    });
    Webcam.attach(my_camera);
    // }
}

//< !--Code to handle taking the snapshot and displaying it locally-- >
function take_snapshot() {


    Webcam.snap(function (data_uri) {

        getBase64 = data_uri
        document.getElementById('results').src = data_uri
    });
    Webcam.reset();
    //if (getMeterNumber != null) {
    //    $("#save").removeClass('hidden')
    //}       
}



$("#save").click(function () {
    console.log("code", barcode)
    console.log("getBase64", getBase64)
    let formData = new FormData();
    formData.append("ImageBase64", getBase64)
    formData.append("Barcode", barcode)
    formData.append("OCREngine", "2")
    fetch('https://localhost:44311/api/Readings', {
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