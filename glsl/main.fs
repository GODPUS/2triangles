#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;

void main() {
    vec4 outColor = vec4( vec3( 0.0 ), 1.0 );
    vec2 pos = gl_FragCoord.xy;
    vec2 center = uResolution.xy / 2.0;
    vec2 normPos = gl_FragCoord.xy / uResolution.xy;
    vec2 normCenter = vec2( 0.5, 0.5 );

    if( distance( pos, center ) < 300.0 ){
        outColor = vec4( 1.0, 0.0, 0.0, 1.0 ); //red
    }

    if( distance( normPos, normCenter ) < 0.1 ){
        outColor = vec4( 1.0, 1.0, 0.0, 1.0 ); //yellow
    }

    gl_FragColor = outColor;
}