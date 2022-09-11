// precision mediump float; //prepended in ShaderMaterial
//float precision(精度):highp,mediump,lowp

uniform vec3 uColor;  
uniform sampler2D uTexture;   //sampler2D:type of texture

// varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main(){
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(vRandom, vRandom*0.5, 1.0, 1.0);
    
    // gl_FragColor = vec4(uColor, 1.0);
    vec4 textureColor = texture2D(uTexture,vUv);
    textureColor.rgb *= vElevation * 2.0 + 0.5;
    gl_FragColor = textureColor;
}