;(function($){
    $(function(){
        
        var container;
        var camera, scene, renderer, composer;
        var lastPass = null;
        var webcam = null;
        var webcamTexture = new THREE.Texture({ minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });

        var DEFAULT_VS = $('#vs').text().trim();
        var DEFAULT_FS = $('#fs').text().trim();
        var DEFAULT_UNIFORMS = {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2() },
            mouse: { type: "v2", value: new THREE.Vector2() },
            webcam: { type: "t", value: webcamTexture }
        };
        var MOUSE = { x: 0, y: 0 };
        var WIDTH = 0;
        var HEIGHT = 0;
        var TIME = 0;
        var START_TIME = Date.now();
        var GUI = new dat.GUI();

        var controls ={};
        var shaders = {};
        var uniforms = {};

        var defaultData = {
            hideCode: false,
            quality: 2,
            webcam: false,

            controls: [
                {
                    name: "Speed",
                    uniform: {
                        name: "speed",
                        type: "f",
                        value: 50.0
                    },
                    type: "slider",
                    min: 0,
                    max: 100
                }
            ],

            shaders: [
                {
                    id: 0,
                    name: "Default Shader",
                    vs: DEFAULT_VS,
                    fs: DEFAULT_FS,
                    active: true
                }
            ]
        };

        var data = $.extend(true, defaultData, {});

        function init() {
            container = document.getElementById('container');

            camera = new THREE.Camera();
            camera.position.z = 1;

            scene = new THREE.Scene();

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            composer = new THREE.EffectComposer(renderer);


            var mainFolder = GUI.addFolder('Main Controls');
            var userFolder = GUI.addFolder('User Controls');
            mainFolder.open();
            userFolder.open();

            var $codeMirrorContainer = $('#codemirror-container');
            var hideCode = mainFolder.add(data, 'hideCode').listen();
            hideCode.onFinishChange(function(value){
                $codeMirrorContainer.toggleClass('disabled', value);
            });
            var quality = mainFolder.add(data, 'quality', [0.5, 1, 2, 4, 8]).listen();
            quality.onFinishChange(function(value){
                onWindowResize();
            });

            $.each(data.controls, function(index, control){
                addControl(control);
            });

            $.each(data.shaders, function(index, shader){
                addShader(shader);
            });

            onWindowResize();
            window.addEventListener( 'resize', onWindowResize, false );
            $(document).on('mousemove', function(event){
                MOUSE.x = event.pageX/window.innerWidth;
                MOUSE.y = event.pageY/window.innerHeight;
            });
        }

        function addControl(control){
            uniforms[control.uniform.name] = { type: control.uniform.type, value: control.uniform.value };

            switch(control.type){
                case "checkbox":
                break;
                case "dropdown":
                break;
                case "slider":
                break;
            }
        }

        function addShader(shader){
            var $tabButton = $('<button id="shader-tab-button--'+shader.id+'" class="shader-tab-button" data-shader-id="'+shader.id+'">'+shader.name+'</button>');
            $tabButton.appendTo($('#shader-tab-buttons'));
            $tabButton.click(function(){ activateTab($(this).data('shader-id')); });

            var $textArea = $('<textarea id="shader-tab-pane--'+shader.id+'" class="shader-tab-pane"></textarea>');
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

        function onWindowResize(event) {
            WIDTH = window.innerWidth / data.quality;
            HEIGHT = window.innerHeight / data.quality;
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
            });
        }

        $('#add-shader-button').click(function(){ addShader(); });

        init();
        animate();

    });
})(jQuery);