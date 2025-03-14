varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;
uniform float uMaxElevation;
uniform float uRadius;
uniform float uTime;
uniform float uWindStrength;
uniform float uWindSpeed;
uniform float uWindFrequency;

void main() {
    vUv = uv;

    float distanceFromCenter = length(position.xy);
    float normalizedDistance = distanceFromCenter / uRadius;
    float elevation = exp(-pow(normalizedDistance, 4.0)) * uMaxElevation;
    elevation *= sqrt(1.0 - pow(normalizedDistance, 2.0));
    
    vec3 displacedPosition = position + normal * elevation;

    float windEffect = sin(displacedPosition.z * uWindFrequency + uTime * uWindSpeed) * uWindStrength;
    
    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    float verticalFade = smoothstep(3.0, 0.0, vWorldPosition.y);
    
    displacedPosition.x += windEffect * verticalFade;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displacedPosition, 1.0);
}