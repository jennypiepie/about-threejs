import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


//GUI
const gui = new dat.GUI()

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()


const object1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({color:'#ff0000'})
)
object1.position.x = -2

const object2 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({color:'#ff0000'})
)

const object3 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({color:'#ff0000'})
)
object2.position.x = 2
scene.add(object1, object2, object3)

//Raycaster

const raycaster = new THREE.Raycaster()
// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0, 0)
// rayDirection.normalize() //不改变射线的方向但将长度变为1

// raycaster.set(rayOrigin,rayDirection)

// const intersect = raycaster.intersectObject(object2)
// console.log(intersect);

// const intersects = raycaster.intersectObjects(object1, object2, object3)
// console.log(intersects);


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const k = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(75, k,0.1,100)
camera.position.set(1,1,3)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

var renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(sizes.width, sizes.height);

//mouse
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1  //-1到1
    mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('click', () => {
    if (currentIntersect) {
        // console.log('click on a sphere');
        // if (currentIntersect.object === object1) {
        //     console.log('click on object1');
        // }else if (currentIntersect.object === object2) {
        //     console.log('click on object2');
        // }else if (currentIntersect.object === object3) {
        //     console.log('click on object3');
        // }

        switch (currentIntersect.object) {
            case object1:
                console.log('click on object1');
                break
            case object2:
                console.log('click on object2');
                break
            case object3:
                console.log('click on object3');
                break
        }
    }
})

const clock = new THREE.Clock()

let currentIntersect = null

const tick = () => {
    const elapseTime = clock.getElapsedTime()

    object1.position.y = Math.sin(elapseTime * 0.3) * 1.5
    object2.position.y = Math.sin(elapseTime * 0.8) * 1.5
    object3.position.y = Math.sin(elapseTime * 1.4) * 1.5

    raycaster.setFromCamera(mouse,camera)  //从相机到鼠标位置的射线
    
    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(1, 0, 0)
    // rayDirection.normalize()

    // raycaster.set(rayOrigin, rayDirection)

    const objectsToTest = [object1, object2, object3]
    const intersects = raycaster.intersectObjects(objectsToTest)

    for (const object of objectsToTest) {
        object.material.color.set('#ff0000')
    }

    for (const intersect of intersects) {
        intersect.object.material.color.set('#0000ff')
    }

    if (intersects.length) {
        if (currentIntersect === null) { 
            console.log('mouse enter');
        }
        currentIntersect = intersects[0]
    } else {
        if (currentIntersect) {
            console.log('mouse leave');
        }
        currentIntersect = null
    }
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()