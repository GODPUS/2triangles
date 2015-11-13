var data = {};

;(function($){
    $(function(){
        
        var container;
        var camera, scene, renderer, composer;
        var controlsFolder = null;
        var webcam = null;
        var webcamTexture = new THREE.Texture();
        webcamTexture.minFilter = THREE.LinearFilter;
        webcamTexture.magFilter = THREE.LinearFilter;

        var uniforms = {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2() },
            mouse: { type: "v2", value: new THREE.Vector2() },
            scroll: { type: "f", value: 0.0 },
            webcam: { type: "t", value: webcamTexture }
        };

        var DEFAULT_VS = $('#vs').text().trim();
        var DEFAULT_FS = $('#fs').text().trim();
        var MOUSE = { x: 0.0, y: 0.0 };
        var SCROLL = 0.0;
        var WIDTH = 0.0;
        var HEIGHT = 0.0;
        var TIME = 0.0;
        var START_TIME = Date.now();
        var GUI = new dat.GUI();

        data = {
            settings: {
                hideCode: false,
                quality: 2,
                webcam: true
            },

            controls: [
                {
                    name: "speed",
                    type: "slider",
                    min: 0.0,
                    max: 1.0,
                    step: 0.001,
                    speed: 0.1
                }
            ],

            shaders: [
                {
                    id: generateUUID(),
                    name: "Default Shader",
                    vs: DEFAULT_VS,
                    fs: DEFAULT_FS
                }
            ]
        };

        function init3D() {
            container = document.getElementById('container');

            camera = new THREE.Camera();
            camera.position.z = 1;

            scene = new THREE.Scene();

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            composer = new THREE.EffectComposer(renderer);
        }

        function initGUI(){

            var settingsFolder = GUI.addFolder('Settings');
            controlsFolder = GUI.addFolder('Controls');
            settingsFolder.open();
            controlsFolder.open();

            var hideCodeCheckbox = settingsFolder.add(data.settings, 'hideCode').listen();
            hideCodeCheckbox.onFinishChange(function(value){
                $('#codemirror-container').toggleClass('disabled', value);
            });
            var qualityDropdown = settingsFolder.add(data.settings, 'quality', [0.5, 1, 2, 4, 8]).listen();
            qualityDropdown.onFinishChange(function(value){
                onWindowResize();
            });
            var webcamCheckbox = settingsFolder.add(data.settings, 'webcam');
            webcamCheckbox.onFinishChange(function(value){
                if(value){
                    getWebcam();
                }else{
                    webcam = null;
                    webcamTexture.image = THREE.ImageUtils.generateDataTexture(0,0,0);
                    webcamTexture.needsUpdate = true;
                }
            });

            if(data.settings.webcam){ getWebcam(); }

            $.each(data.controls, function(index, control){
                addControl(control, false);
            });
        }

        function initShaders(){
            $.each(data.shaders, function(index, shader){
                addShader(shader, false);
            });
        }

        function initEvents(){
            $('#add-shader-button').click(function(){ 
                addShader({
                    id: generateUUID(),
                    name: "Default Shader",
                    vs: DEFAULT_VS,
                    fs: DEFAULT_FS
                }, true); 
            });

            var $addControlBtn = $('#add-control-btn');
            $addControlBtn.insertAfter('.dg.main .close-button');
            $addControlBtn.click(function(){
                $('#add-control-dialog').fadeIn(300);
            });

            $(document).on('mousemove', function(event){
                MOUSE.x = event.pageX/window.innerWidth;
                MOUSE.y = event.pageY/window.innerHeight;
            });

            var $window = $(window);

            $window.on('mousewheel', function(event) {
                SCROLL += (event.originalEvent.deltaY)*-1.0;
                if(SCROLL < 0){ SCROLL = 0.0; }
            });

            setTimeout(onWindowResize, 3000);
            $window.resize(onWindowResize);
        }

        function getWebcam(){
            getWebcamFromVideo(function(_webcam){
                webcam = _webcam;
                webcamTexture.image = webcam;
                webcamTexture.needsUpdate = true;
                onWindowResize();
            });
        }

        function addControl(control, addToData){
            if(addToData){ data.controls.push(control); }

            uniforms[control.name] = { type: "f", value: control.value };

            switch(control.type){
                case "checkbox":
                break;
                case "dropdown":
                break;
                case "slider":
                    controlsFolder.add(control, control.name).min(control.min).max(control.max).step(control.step).listen();
                break;
            }
        }

        function addShader(shader, addToData){
            if(addToData){ data.shaders.push(shader); }

            var $tabButton = $('<button class="shader-tab-button" data-shader-id="'+shader.id+'">'+shader.name+'</button>');
            $tabButton.appendTo($('#shader-tab-buttons'));
            $tabButton.click(function(){ activateTab($(this).data('shader-id')); });

            var $textArea = $('<textarea class="shader-tab-pane"></textarea>');
            $textArea.text(DEFAULT_FS);
            $textArea.appendTo($('#shader-tab-panes'));

            var editor = CodeMirror.fromTextArea($textArea[0], {
                keyMap: 'sublime',
                lineNumbers: true,
                theme: 'monokai',
                mode: 'x-shader/x-fragment'
            });

            $(editor.getWrapperElement()).attr('data-shader-id', shader.id);

            var pass = new THREE.ShaderPass({ uniforms: uniforms, vertexShader: DEFAULT_VS, fragmentShader: DEFAULT_FS }, renderer);
            composer.addPass(pass);
            composer.passes[composer.passes.length-1].renderToScreen = true;

            editor.on('change', function(){
                pass.material.fragmentShader = editor.getValue();
                pass.material.needsUpdate = true;
            });

            activateTab(shader.id);
        }

        function activateTab(id){
            $('[data-shader-id]').not('[data-shader-id="'+id+'"]').removeClass('active');
            $('[data-shader-id="'+id+'"]').addClass('active');
        }

        function saveToData(){
            //ajax save data to db
            console.log(data);
        }

        function onWindowResize(event) {
            WIDTH = window.innerWidth / data.settings.quality;
            HEIGHT = window.innerHeight / data.settings.quality;
            composer.setSize(WIDTH, HEIGHT);
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
        }

        function render() {
            updateUniforms();
            composer.render(scene, camera);
        }
        
        function updateUniforms(){
            TIME = (Date.now() - START_TIME) / 1000;
            if (webcam && webcam.readyState === webcam.HAVE_ENOUGH_DATA){ webcamTexture.needsUpdate = true; }

            $.each(composer.passes, function(index, pass){
                pass.uniforms.webcam.value = webcamTexture;
                pass.uniforms.time.value = TIME;
                pass.uniforms.resolution.value.x = WIDTH;
                pass.uniforms.resolution.value.y = HEIGHT;
                pass.uniforms.mouse.value.x = MOUSE.x;
                pass.uniforms.mouse.value.y = MOUSE.y;
                pass.uniforms.scroll.value = SCROLL;

                $.each(data.controls, function(index, control){
                    pass.uniforms[control.name].value = control[control.name];
                });
            });
        }

        init3D();
        initGUI();
        initShaders();
        initEvents();
        animate();

    });
})(jQuery);