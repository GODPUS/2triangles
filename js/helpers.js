if (!Date.now) {
    Date.now = function() {
        return +new Date();
    };
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function getWebcamFromVideo(callback){
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