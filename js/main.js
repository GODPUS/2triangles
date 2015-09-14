;(function($){
    $(function(){
        
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
        var vs = $('#vs').text().trim();
        var fs = $('#fs').text().trim();
        var mouse = { x: 0.5, y: 0.5 };
        var controls = null;
        var gui = null;
        var QUALITY = 1;

        var idCounter = 1;
        var shaders = {};

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
                time: { type: "f", value: 1.0 },
                resolution: { type: "v2", value: new THREE.Vector2() },
                mouse: { type: "v2", value: new THREE.Vector2() }
            };

            if(webcam){
                webcamTexture = new THREE.Texture( webcam );
                webcamTexture.minFilter = THREE.LinearFilter;
                webcamTexture.magFilter = THREE.LinearFilter;
                uniforms.webcam = { type: "t", value: webcamTexture };
            }

            addShader();

            onWindowResize();
            window.addEventListener( 'resize', onWindowResize, false );

            $(document).on('mousemove', function(event){
                mouse.x = event.pageX/window.innerWidth;
                mouse.y = event.pageY/window.innerHeight;
            });

            var Controls = function() {
                this.quality = 1;
                this.hideCode = false;
            };

            controls = new Controls();
            gui = new dat.GUI();
            var mainFolder = gui.addFolder('Main Controls');
            var userFolder = gui.addFolder('User Controls');
            mainFolder.open();
            userFolder.open();

            var $codeMirrorContainer = $('#codemirror-container');
            var hideCode = mainFolder.add(controls, 'hideCode');
            hideCode.onFinishChange(function(value){
                $codeMirrorContainer.toggleClass('disabled', value);
            });
            var quality = mainFolder.add(controls, 'quality', [0.5, 1, 2, 4, 8]);
            quality.onFinishChange(function(value){
                QUALITY = value;
                onWindowResize();
            });
        }

        function addShader(){
            var $tabButton = $('<button id="shader-tab-button--'+idCounter+'" class="shader-tab-button" data-shader-id="'+idCounter+'">Shader #'+idCounter+'</button>');
            $tabButton.appendTo($('#shader-tab-buttons'));
            $tabButton.click(function(){ activateTab($(this).data('shader-id')); });

            var $textArea = $('<textarea id="shader-tab-pane--'+idCounter+'" class="shader-tab-pane"></textarea>');
            $textArea.text(fs);
            $textArea.appendTo($('#shader-tab-panes'));

            var editor = CodeMirror.fromTextArea($textArea[0], {
                keyMap: 'sublime',
                lineNumbers: true,
                theme: 'monokai',
                mode: 'x-shader/x-fragment'
            });

            var pass = new THREE.ShaderPass({ uniforms: uniforms, vertexShader: vs, fragmentShader: fs });
            composer.addPass(pass);
            lastPass = composer.passes[composer.passes.length-1];
            lastPass.renderToScreen = true;

            shaders[idCounter] = {
                'id': idCounter,
                'editor': editor,
                '$editor': $(editor.getWrapperElement()),
                '$tabButton': $tabButton,
                '$textArea': $textArea,
                'pass': pass
            };

            editor.on('change', function(){
                pass.material.fragmentShader = editor.getValue();
                pass.material.needsUpdate = true;
            });

            activateTab(idCounter);

            idCounter++;

            render();
        }

        function activateTab(id){
            $.each(shaders, function(key, shader){
                var isID = key.toString() === id.toString();
                shader.$editor.toggleClass('active', isID);
                shader.$tabButton.toggleClass('active', isID);
            });
        }

        function onWindowResize( event ) {
            composer.setSize( window.innerWidth / QUALITY, window.innerHeight / QUALITY );
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
                if(webcam && webcamTexture){ pass.uniforms.webcam.value = webcamTexture; }
                pass.uniforms.time.value = time;
                pass.uniforms.resolution.value.x = window.innerWidth / QUALITY;
                pass.uniforms.resolution.value.y = window.innerHeight / QUALITY;
                pass.uniforms.mouse.value.x = mouse.x;
                pass.uniforms.mouse.value.y = mouse.y;
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

        $('#add-shader-button').click(function(){ addShader(); });

        init();
        animate();

    });
})(jQuery);