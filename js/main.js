;(function($){
    $(function(){

        var editor = CodeMirror.fromTextArea($('.code')[0], {
            keyMap: 'sublime',
            lineNumbers: true,
            theme: 'monokai',
            mode: 'x-shader/x-fragment'
        });
        
        var USE_WEB_CAM = false;
        var container;
        var camera, scene, renderer, composer;
        var uniforms = {};
        var shaders = {};
        var startTime = Date.now();
        var time = 0;
        var lastPass = null;
        var webcam = null;
        var webcamTexture = null;

        loadShaders( 'glsl/', ['main.vs', 'main.fs', 'pass1.fs', 'pass2.fs'], function(_shaders){
            shaders = _shaders;
            console.log(shaders);

            if(USE_WEB_CAM){
                getWebcamVideo(function(){
                    init();
                    animate();
                });
            }else{
                init();
                animate();
            }
        });

        function init() {
            container = document.getElementById( 'container' );

            camera = new THREE.Camera();
            camera.position.z = 1;

            scene = new THREE.Scene();

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            container.appendChild( renderer.domElement );

            composer = new THREE.EffectComposer( renderer );
            
            uniforms = {
                uTime: { type: "f", value: 1.0 },
                uResolution: { type: "v2", value: new THREE.Vector2() }
            };

            if(webcam){
                webcamTexture = new THREE.Texture( webcam );
                webcamTexture.minFilter = THREE.LinearFilter;
                webcamTexture.magFilter = THREE.LinearFilter;
                uniforms.uWebcam = { type: "t", value: webcamTexture };
            }

            composer.addPass( new THREE.ShaderPass({ uniforms: uniforms, vertexShader: shaders.vs.main, fragmentShader: shaders.fs.main }) );
            composer.addPass( new THREE.ShaderPass({ uniforms: uniforms, vertexShader: shaders.vs.main, fragmentShader: shaders.fs.pass1 }) );
            //composer.addPass( new THREE.ShaderPass({ uniforms: uniforms, vertexShader: shaders.vs.main, fragmentShader: shaders.fs.pass2 }) );

            lastPass = composer.passes[composer.passes.length-1];
            lastPass.renderToScreen = true;

            onWindowResize();
            window.addEventListener( 'resize', onWindowResize, false );
        }

        function onWindowResize( event ) {
            composer.setSize( window.innerWidth, window.innerHeight );

            $.each(composer.passes, function( index, pass ){
                pass.uniforms.uResolution.value.x = window.innerWidth;
                pass.uniforms.uResolution.value.y = window.innerHeight;
            });
        }

        function animate() {
            requestAnimationFrame( animate );
            render();
        }

        function render() {
            updateUniforms();
            composer.render( scene, camera );
        }
        
        function updateUniforms(){
            time = ( Date.now() - startTime ) / 1000;
            if ( webcam && webcam.readyState === webcam.HAVE_ENOUGH_DATA && webcamTexture ){ webcamTexture.needsUpdate = true; }

            $.each(composer.passes, function( index, pass ){
                if(webcam && webcamTexture){ pass.uniforms.uWebcam.value = webcamTexture; }
                pass.uniforms.uTime.value = time;
            });
        }

        function getWebcamVideo(callback){
            //Use webcam
            webcam = document.createElement('video');
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
                callback();
            }, function(error) {
                prompt.innerHTML = 'Unable to capture WebCam. Please reload the page.';
                webcam = null;
                callback();
            });
        }

    });
})(jQuery);