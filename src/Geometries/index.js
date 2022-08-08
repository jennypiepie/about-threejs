import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { Face3, Geometry} from 'three/examples/jsm/deprecated/Geometry.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'

//debug
const gui = new dat.GUI({ closed: true, width: 400})

const parameters = {
    color: 0x00FFFF,
    spin: () => {
        gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + 10 })
    }
}
gui.addColor(parameters, 'color')
    .onChange(() => {
        material.color.set(parameters.color)
    })
gui.add(parameters,'spin')

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// const geometry = new Geometry()

// const vertex1 = new THREE.Vector3(0, 0, 0)
// const vertex2 = new THREE.Vector3(0, 1, 0)
// const vertex3 = new THREE.Vector3(1, 0, 0)
// geometry.vertices.push(vertex1,vertex2,vertex3)

// const face = new Face3(0, 1, 2)
// geometry.faces.push(face)
// const geometry = new THREE.BoxBufferGeometry(1, 1, 1,4,4,4)
const geometry = new THREE.BufferGeometry()
// const positionsArray = new Float32Array([
//     0, 0, 0,
//     0, 1, 0,
//     1, 0, 0
// ])
// const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)

// geometry.setAttribute('position',positionsAttribute)
const count = 50
const positionsArray = new Float32Array(count * 3 * 3)

for (let i = 0; i < count * 3 * 3; i++){
    positionsArray[i] = (Math.random() - 0.5)*4
}

const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
geometry.setAttribute('position',positionsAttribute)

const material = new THREE.MeshBasicMaterial({
    color: parameters.color,
    wireframe:true
    })
const mesh = new THREE.Mesh(geometry,material)
scene.add(mesh)

gui.add(mesh.position, 'y', -3, 3, 0.01)  //最大值 最小值 调试精度
gui.add(mesh.position, 'z').min(-3).max(3).step(0.01).name('distance') //也可以这么写
gui.add(mesh, 'visible')
gui.add(material, 'wireframe')

const k = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(75, k,0.1,100)
camera.position.set(1, 1, 3)
camera.lookAt(mesh.position)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
//增加阻尼
controls.enableDamping = true

var renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(sizes.width, sizes.height);

const tick = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()