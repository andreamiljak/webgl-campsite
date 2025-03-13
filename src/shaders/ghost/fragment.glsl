varying vec2 vUv;
varying float vElevation;
uniform float uMaxElevation;
uniform vec3 uColor;


void main() {
    vec2 centeredUV = vUv * 2.0 - 1.0; 
    float distanceFromCenter = length(centeredUV);
    float alpha = exp(-distanceFromCenter * distanceFromCenter * 1.0);

    gl_FragColor = vec4(uColor, alpha);
}