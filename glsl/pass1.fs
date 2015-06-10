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

    float angle = uTime;
    float amount = 0.05;
    vec2 offset = amount * vec2( cos(angle), sin(angle));
    vec4 cr = texture2D(uTexture, normPos + offset);
    vec4 cga = texture2D(uTexture, normPos);
    vec4 cb = texture2D(uTexture, normPos - offset);

    gl_FragColor = vec4(cr.r, cr.g, cr.b, cga.a);
}