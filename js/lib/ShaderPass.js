/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "uTexture";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	this.uniforms[ this.textureID ] = { type: "t", value: null };

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

		if ( this.uniforms[ this.textureID ] ) {
			this.uniforms[ this.textureID ].value = readBuffer;
		}

		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		if ( this.renderToScreen ) {
			renderer.render( this.scene, this.camera );
		}

	}

};