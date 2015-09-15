if (!Date.now) {
    Date.now = function() {
        return +new Date();
    };
}

function getWebcamVideo(callback){
    //Use webcam
    var webcam = document.createElement('video');
    webcam.width = 320;
    webcam.height = 320;
    webcam.autoplay = true;
    webcam.loop = true;
    //Webcam webcam
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    //get webcam
    navigator.getUserMedia({
        video: true
    }, function(stream) {
        //on webcam enabled
        webcam.src = window.URL.createObjectURL(stream);
        callback(webcam);
    }, function(error) {
        webcam = null;
        callback(webcam);
    });
}