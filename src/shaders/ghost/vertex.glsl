varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;
uniform float uMaxElevation;
uniform float uRadius;
uniform float uTime;

void main() {
    vUv = uv;

    float distanceFromCenter = length(position.xy);
    float normalizedDistance = distanceFromCenter / uRadius;
    float elevation = exp(-pow(normalizedDistance, 4.0)) * uMaxElevation;
    elevation *= sqrt(1.0 - pow(normalizedDistance, 2.0));
    
    vec3 displacedPosition = position + normal * elevation;

    float windStrength = 0.3;
    float windSpeed = 4.0;
    float windFrequency = 0.8;
    float windEffect = sin(displacedPosition.z * windFrequency + uTime * windSpeed) * windStrength;
    
    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    float verticalFade = smoothstep(3.0, 0.0, vWorldPosition.y);
    
    displacedPosition.x += windEffect * verticalFade;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displacedPosition, 1.0);
}