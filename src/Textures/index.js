import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

// const image = new Image()
// const texture = new THREE.Texture(image)

// image.onload = () => {
//     texture.needsUpdate = true
// }
// image.src = '../static/textures/wood.jpg'

const loadingManager = new THREE.LoadingManager()
// loadingManager.onStart = () => {
//     console.log('onStart');
// }
// loadingManager.onLoad = () => {
//     console.log('onLoad');
// }
// loadingManager.onProgress = () => {
//     console.log('onProgress');
// }
// loadingManager.onError = () => {
//     console.log('onError');
// }
const textureLoader = new THREE.TextureLoader(loadingManager)
const colortexture = textureLoader.load('../static/textures/wood.jpg')
// colortexture.repeat.x = 2
// colortexture.wrapS = THREE.MirroredRepeatWrapping 
colortexture.offset.y = 0.5
colortexture.rotation = 1
colortexture.center.x = 0.5
colortexture.center.y = 0.5

// colortexture.minFilter = THREE.NearestFilter
colortexture.magFilter = THREE.NearestFilter

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.35, 32, 100),
    new THREE.MeshBasicMaterial({map:colortexture})
)
scene.add(mesh)


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
window.addEventListener('resize', () => {
    //update size
    sizes.width = window.innerWidth,
    sizes.height = window.innerHeight
    
    //update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))//2 is enough
})

const k = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(75, k,0.1,100)
// const camera = new THREE.OrthographicCamera(-1*k, 1*k, 1, -1, 0.1, 100)
camera.position.set(0, 0, 3)
camera.lookAt(mesh.position)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
//增加阻尼
controls.enableDamping = true


var renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0xb9d3ff, 1); 

const tick = () => {

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()