import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import '../style.css'

//loaders
let sceneReady = false
const loadingBarElement = document.querySelector('.loading-bar')
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
        }, 500)
        
        window.setTimeout(() => {
            sceneReady = true
        },2500)
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
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) => {
        console.log(gltf);
        gltf.scene.scale.set(2, 2, 2)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)
        
        updateAllMaterials()
    }
)


const raycaster = new THREE.Raycaster()
//points of interest
const points = [
    {
        position: new THREE.Vector3(1.55, 0.3, -0.6),
        element:document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(0.5, 0.8, -1.6),
        element:document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(1.6, -1.3, -0.7),
        element:document.querySelector('.point-2')
    }
]


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
    
    //update controls
    controls.update()
    if (sceneReady) {
        //go through each point
        for (const point of points) {
            const screenPosition = point.position.clone()
            screenPosition.project(camera) //2d position from -1 to 1 normalized device coordinates 

            raycaster.setFromCamera(screenPosition,camera) //only use x and y
            
            const intersects = raycaster.intersectObjects(scene.children,true)
            
            if (intersects.length === 0) {
                point.element.classList.add('visible')
            } else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)

                if (intersectionDistance < pointDistance) {
                    point.element.classList.remove('visible')    
                } else {
                    point.element.classList.add('visible')
                }
                
            }

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
        }
    }


    //renderer
    renderer.render(scene, camera)
    //call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()