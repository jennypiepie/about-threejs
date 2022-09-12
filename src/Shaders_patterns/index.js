import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import { random } from 'gsap'
import { DoubleSide } from 'three'

//GUI
const gui = new dat.GUI()

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

//texture
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('/textures/flag/flag.png')
//geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)


//material
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    side:THREE.DoubleSide
})

//mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

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
camera.position.set(0, 0, 1)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


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