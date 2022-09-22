import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { LinearFilter, RGBAFormat } from 'three'

//loaders
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

//GUI
const gui = new dat.GUI()

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

//update all materials
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = 5
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
    //traverse will go through each child of the scene whatever how deep they are
}

//environment Map
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/1/px.png',
    '/textures/environmentMaps/1/nx.png',
    '/textures/environmentMaps/1/py.png',
    '/textures/environmentMaps/1/ny.png',
    '/textures/environmentMaps/1/pz.png',
    '/textures/environmentMaps/1/nz.png'
])
environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap


//models
gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) => {
        console.log(gltf);
        gltf.scene.scale.set(2, 2, 2)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)
        
        updateAllMaterials()
    }
)

//light
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.shadow.mapSize.set(1024,1024)
scene.add(directionalLight)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    //update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    //update effect composer
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(sizes.width, sizes.height)
})


const camera = new THREE.PerspectiveCamera(75,sizes.width / sizes.height,0.1,100)
camera.position.set(4, 1, -4)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

var renderer = new THREE.WebGLRenderer({
    canvas,
    antialias:true //抗锯齿
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping   
renderer.toneMappingExposure = 1.5  
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

//post processing

//render target
let RenderTargetClass = null

if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
    RenderTargetClass = THREE.WebGLMultisampleRenderTarget  //1.有抗锯齿的renderTarget 
} else {
    RenderTargetClass = THREE.WebGLRenderTarget
}

const renderTarget = new RenderTargetClass(
    800,    //  width
    600,    //  height
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
        //使用effectComposer后原来renderer里的outputEncoding会失效，而renderTarget里默认的encoding是LinearEncoding
        //so 重新定义一个renderTarget，将encoding设置为sRGBEncoding
    }
)

//composer
const effectComposer = new EffectComposer(renderer,renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

//render pass
const renderPass = new RenderPass(scene,camera)
effectComposer.addPass(renderPass)

// 1.DotScreenPass
const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false
effectComposer.addPass(dotScreenPass)

// 2.GlitchPass
const glitchPass = new GlitchPass()
glitchPass.goWild = false
glitchPass.enabled = false
effectComposer.addPass(glitchPass)

//3.RGBShiftPass
const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = false
effectComposer.addPass(rgbShiftPass)

//4.UnrealBloomPass
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 0.3
unrealBloomPass.radius = 1
unrealBloomPass.threshold = 0.6
effectComposer.addPass(unrealBloomPass)

gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)


//Tint Pass
const TintShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTint: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;

        void main(){
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;

        varying vec2 vUv;

        void main(){
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb += uTint;

            gl_FragColor = color;
        }
    `
}
const tintPass = new ShaderPass(TintShader)
tintPass.material.uniforms.uTint.value = new THREE.Vector3()
effectComposer.addPass(tintPass)

gui.add(tintPass.material.uniforms.uTint.value, 'x').min(-1).max(1).step(0.001).name('red')
gui.add(tintPass.material.uniforms.uTint.value,'y').min(-1).max(1).step(0.001).name('green')
gui.add(tintPass.material.uniforms.uTint.value,'z').min(-1).max(1).step(0.001).name('blue')

//DisplacementPass
const DisplacementShader = {
    uniforms: {
        tDiffuse: { value: null },
        uNormalMap: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;

        void main(){
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D uNormalMap;

        varying vec2 vUv;

        void main(){
            vec3 normalColor = texture2D(uNormalMap,vUv).xyz * 2.0 - 1.0;

            vec2 newUv = vUv + normalColor.xy * 0.1;
            vec4 color = texture2D(tDiffuse, newUv);

            vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
            float lightness =clamp(dot(normalColor, lightDirection), 0.0, 1.0);
            //dot函数:参数为两个向量，结果为两个向量相乘；normalize:将向量长度变为1
            color.rgb += lightness * 2.0;

            gl_FragColor =color;
        }
    `
}
const displacementPass = new ShaderPass(DisplacementShader)
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load(
    '/textures/normalMaps/normal.jpg'
)
effectComposer.addPass(displacementPass)


//SMAAPass //2.抗锯齿Pass
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
}
//if pixel radio >1 use WebGLRenderTarget and no antialias pass
//if pixel radio = 1 and browser supports webgl2 use WebGLMultisampleRenderTarget
//if pixel radio = 1 and browser doesn't supports webgl2 use SMAAPass


const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapseTime = clock.getElapsedTime()
    
    //update pass

    
    //update controls
    controls.update()

    //renderer
    // renderer.render(scene, camera)
    effectComposer.render()

    //call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()