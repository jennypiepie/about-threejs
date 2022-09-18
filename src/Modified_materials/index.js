import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

//GUI
const gui = new dat.GUI()

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

//loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

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
//2.直接设置environment属性，可以将environmentMap应用于每一个支持environmentMap的material
scene.environment = environmentMap

//texture
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
mapTexture.encoding = THREE.sRGBEncoding

const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

//material
const material = new THREE.MeshStandardMaterial({
    map: mapTexture,
    normalMap:normalTexture
})

material.onBeforeCompile = (shader) => {
    // console.log(shader.vertexShader);
    shader.vertextShader = shader.vertextShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>
            transform.y +=1.0;
            //do some transform here but i don't know why the material didn't work TAT 
        `
    )
}

//models
gltfLoader.load(
    '/models/LeePerrySmith/LeePerrySmith.glb',
    (gltf) => {
        const mesh = gltf.scene.children[0]
        console.log(mesh.children[0]);
        mesh.scale.set(10, 10, 10)
        mesh.material = material
        scene.add(mesh)
        updateAllMaterials()
    }
)

//light
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, 2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})


const camera = new THREE.PerspectiveCamera(75,sizes.width / sizes.height,0.1,100)
camera.position.set(2, 2, 2)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

var renderer = new THREE.WebGLRenderer({
    canvas,
    antialias:true
});
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))

const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()
    
    //update controls
    controls.update()
    //renderer
    renderer.render(scene, camera)
    //call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()