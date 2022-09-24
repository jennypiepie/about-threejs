import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import '../style.css'


const loadingBarElement = document.querySelector('.loading-bar')

//loaders
const loadingManager = new THREE.LoadingManager(
    //loaded
    () => {
        
        // gsap.delayedCall(0.5,() => {
        //     gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
        //     loadingBarElement.classList.add('ended')
        //     loadingBarElement.style.transform = ''
        // })

        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        },500)
    },
    //progress
    (itemUrl,itemsLoaded,itemsTotal) => {
        // console.log(itemUrl,itemsLoaded,itemsTotal);
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
        
    }
)
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)


const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

//overlay
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({ 
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main(){
            gl_Position = vec4(position,1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main(){
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }

    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

//update all materials
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            //1.遍历
            // child.material.envMap = environmentMap
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

//models
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10)
        gltf.scene.position.set(0, -4, 0)
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
camera.position.set(2, 3, 4)
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