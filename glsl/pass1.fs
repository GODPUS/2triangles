#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    vec4 outColor = vec4( vec3( 0.0 ), 1.0 );
    vec2 pos = gl_FragCoord.xy;
    vec2 center = uResolution.xy / 2.0;
    vec2 normPos = gl_FragCoord.xy / uResolution.xy;
    vec2 normCenter = vec2( 0.5, 0.5 );

    vec4 texture = texture2D(uTexture, normPos);

    outColor.r = texture.r + normPos.x;
    outColor.g = texture.g + normPos.y;
    outColor.b = texture.g + cos(uTime);

    gl_FragColor = outColor;
}