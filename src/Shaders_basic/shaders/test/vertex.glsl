// uniform mat4 projectionMatrix;  //prepended in ShaderMaterial
//transform the coordinates into the clip space coordinates
// uniform mat4 viewMatrix;    //prepended in ShaderMaterial
//apply transformations relative to the camera(position,rotation,field of view,near,far)
// uniform mat4 modelMatrix;   //prepended in ShaderMaterial
//apply transformations relative to the mesh(positon,rotation,scale)
uniform vec2 uFrequency;
uniform float uTime;    //do not use too big number like Date.now()

// attribute vec3 position; //prepended in ShaderMaterial
// attribute vec2 uv;  //prepended in ShaderMaterial

// attribute float aRandom;

// varying float vRandom;
varying  vec2 vUv;
varying float vElevation;

void main(){
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0);

    vec4 modelPosition = modelMatrix * vec4(position,1.0);

    float elevation = sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;

    modelPosition.z += elevation;
    // modelPosition.z += sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
    // modelPosition.z += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;
    // modelPosition.z += aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // vRandom = aRandom;

    vUv = uv;
    vElevation = elevation;
}