(function(){

    var container;
    var camera, scene, renderer, composer;
    var uniforms;
    var shaders = {};
    var passes = [];
    var startTime = Date.now();
    var time = 0;

    loadShaders( 'glsl/', ['main.vs', 'main.fs', 'pass1.fs', 'pass2.fs'], function(_shaders){
        shaders = _shaders;
        console.log(shaders);
        init();
        animate();
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
        composer.addPass( new THREE.RenderPass( scene, camera ) );

        uniforms = {
            uTime: { type: "f", value: 1.0 },
            uResolution: { type: "v2", value: new THREE.Vector2() }
        };

        passes.push( new THREE.ShaderPass({ uniforms: uniforms, vertexShader: shaders.vs.main, fragmentShader: shaders.fs.main }) );
        passes.push( new THREE.ShaderPass({ uniforms: uniforms, vertexShader: shaders.vs.main, fragmentShader: shaders.fs.pass1 }) );
        passes.push( new THREE.ShaderPass({ uniforms: uniforms, vertexShader: shaders.vs.main, fragmentShader: shaders.fs.pass2 }) );

        passes[passes.length-1].renderToScreen = true;

        $.each(passes, function( index, pass ){
            composer.addPass( pass );
        });

        onWindowResize();
        window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize( event ) {
        composer.setSize( window.innerWidth, window.innerHeight );

        $.each(passes, function( index, pass ){
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

        $.each(passes, function( index, pass ){
            pass.uniforms.uTime.value = time;
        });
    }
})();