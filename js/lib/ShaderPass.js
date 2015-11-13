/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, renderer ) {
	var pixelRatio = renderer.getPixelRatio();
	var width  = Math.floor( renderer.context.canvas.width  / pixelRatio ) || 1;
	var height = Math.floor( renderer.context.canvas.height / pixelRatio ) || 1;
	var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
	var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

	this.renderer = renderer;

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.backBuffer = this.renderTarget2;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	this.uniforms.texture = { type: "t", value: null };
	this.uniforms.backbuffer = { type: "t", value: null };

	this.material = new THREE.ShaderMaterial( {
        defines: shader.defines || {},
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.material = this.material;
	this.scene.add( this.quad );
};

THREE.ShaderPass.prototype = {
	swapBuffers: function() {
		var tmp = this.backBuffer;
		this.backBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	},

	render: function (renderer, composerWriteBuffer, composerReadBuffer) {		
		this.uniforms.texture.value = composerReadBuffer;
		this.uniforms.backbuffer.value = this.backBuffer;

		//renderer.render(this.scene, this.camera, composerWriteBuffer, this.clear);
		renderer.render(this.scene, this.camera, this.writeBuffer, this.clear);

		if (this.renderToScreen) {
			renderer.render(this.scene, this.camera);
		}

		//this.swapBuffers();
	},

	reset: function (renderTarget, width, height) {

		if (renderTarget === undefined) {
			renderTarget = this.renderTarget.clone();

			var pixelRatio = this.renderer.getPixelRatio();

			renderTarget.width  = width;
			renderTarget.height = height;
		}

		this.renderTarget = renderTarget;

		this.writeBuffer = this.renderTarget.clone();
		this.readBuffer = this.renderTarget.clone();

	}

};