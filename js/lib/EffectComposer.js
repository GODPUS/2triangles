/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function (renderer, renderTarget) {
	this.renderer = renderer;

	if (renderTarget === undefined) {
		var pixelRatio = renderer.getPixelRatio();
		var width  = Math.floor( renderer.context.canvas.width  / pixelRatio ) || 1;
		var height = Math.floor( renderer.context.canvas.height / pixelRatio ) || 1;
		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
		this.renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
	}

	this.writeBuffer = this.renderTarget.clone();
	this.readBuffer = this.renderTarget.clone();

	this.passes = [];
};

THREE.EffectComposer.prototype = {

	swapBuffers: function() {
		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	},

	addPass: function ( pass ) {
		this.passes.push( pass );
	},

	insertPass: function ( pass, index ) {
		this.passes.splice( index, 0, pass );
	},

	render: function ( delta ) {
		var pass, i, il = this.passes.length;

		for (i = 0; i < il; i ++ ) {
			pass = this.passes[ i ];
			pass.render(this.renderer, this.writeBuffer, this.readBuffer);
			//this.swapBuffers();
		}
	},

	reset: function (renderTarget) {
		if (renderTarget === undefined) {
			renderTarget = this.renderTarget.clone();

			var pixelRatio = this.renderer.getPixelRatio();
			renderTarget.width  = Math.floor(this.renderer.context.canvas.width / pixelRatio);
			renderTarget.height = Math.floor(this.renderer.context.canvas.height / pixelRatio);
		}

		this.renderTarget = renderTarget;

		this.writeBuffer = this.renderTarget.clone();
		this.readBuffer = this.renderTarget.clone();
	},

	setSize: function (width, height) {
		this.renderer.setSize(width, height);
		var renderTarget = this.renderTarget.clone();

		renderTarget.width = width;
		renderTarget.height = height;

		this.reset(renderTarget);

		var pass, i, il = this.passes.length;

		for (i = 0; i < il; i ++ ) {
			pass = this.passes[ i ];

			pass.reset( renderTarget, width, height );
		}
	}

};