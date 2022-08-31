import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

//GUI
const gui = new dat.GUI()


const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

// Models
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')//解码器

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        //在往scene中add mesh时，那个mesh同时也会从gltf的scene中删除
        // 1.使用while循环取数组第一个
        // while (gltf.scene.children.length) {
        //     scene.add(gltf.scene.children[0])
        // }
        // 2.拷贝原数组后使用for循环
        // const children = [...gltf.scene.children]
        // for (let child of children) {
        //     scene.add(child)
        // }

        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[1])
        action.play()
        //直接add 整个scene
        gltf.scene.scale.set(0.025, 0.025, 0.025)
        scene.add(gltf.scene)
    }
    // ,
    // () => {
    //     console.log('progress');
    // },
    // () => {
    //     console.log('error');
    // }
)

const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0,
        roughness:0.5
    })
)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)


//light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
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
    canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))


const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapseTime = clock.getElapsedTime()
    const deltaTime = elapseTime - previousTime
    previousTime = elapseTime

    // update mixer
    if (mixer !== null) {
        mixer.update(deltaTime)
    }
    
    //update controls
    controls.update()
    //renderer
    renderer.render(scene, camera)
    //call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()