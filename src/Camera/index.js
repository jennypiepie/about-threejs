import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

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

//双击切换全屏
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
})

const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = - (event.clientY / sizes.height - 0.5)
    //threejs中y轴向上，clientYy轴向下
})

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({color:0xFFFF00})
)
scene.add(mesh)

const point = new THREE.PointLight(0xffffff)
point.position.set(4, 2, 3)
scene.add(point)

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

const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    // mesh.rotation.y = elapsedTime

    // update camera
    // camera.position.set(cursor.x * 3, cursor.y * 3)
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    // camera.position.y = cursor.y * 5
    // camera.lookAt(new THREE.Vector3())  //0,0,0

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()