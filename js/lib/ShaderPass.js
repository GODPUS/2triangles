/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader ) {
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

	render: function ( renderer, writeBuffer, readBuffer ) {

		this.uniforms.texture.value = readBuffer;

		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		if ( this.renderToScreen ) {
			renderer.render( this.scene, this.camera );
		}

	}

};