import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

//loaders
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

//GUI
const gui = new dat.GUI()
const debugObj = {}

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

//update all materials
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            //1.遍历
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObj.envMapIntensity
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

debugObj.envMapIntensity = 5
gui.add(debugObj, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)


//models
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10)
        gltf.scene.position.set(0, -4, 0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        gui.add(gltf.scene.rotation,'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotation')
        
        updateAllMaterials()
    }
)

//light
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024,1024)
scene.add(directionalLight)

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

gui.add(directionalLight,'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('lightZ')

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
    antialias:true //抗锯齿
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.physicallyCorrectLights = true
//easier to get the same result between different softwares
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping    //色调映射
renderer.toneMappingExposure = 3    //色调映射曝光
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
})
//属性值是字符，要转换成数值
.onFinishChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterials()
})
gui.add(renderer,'toneMappingExposure').min(0).max(10).step(0.001)

const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapseTime = clock.getElapsedTime()
    const deltaTime = elapseTime - previousTime
    previousTime = elapseTime

    
    //update controls
    controls.update()
    //renderer
    renderer.render(scene, camera)
    //call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()