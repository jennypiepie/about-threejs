import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats.js'
import { BufferGeometry } from 'three'


const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const camera = new THREE.PerspectiveCamera(75,sizes.width / sizes.height,0.1,100)
camera.position.set(2, 2, 6)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

var renderer = new THREE.WebGLRenderer({
    canvas,
    // powerPreference: 'high-performance', //unnecessary
    antialias: true
});
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial()
)
cube.position.set(-5, 0, 0)
cube.castShadow = true
// cube.receiveShadow = true
scene.add(cube)

const torusKnot = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 128, 32),
    new THREE.MeshStandardMaterial()
)
torusKnot.castShadow = true
// torusKnot.receiveShadow = true
scene.add(torusKnot)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
)
sphere.position.set(5, 0, 0)
sphere.castShadow = true
// sphere.receiveShadow = true
scene.add(sphere)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial()
)
floor.position.set(0, -2, 0)
floor.rotation.x = -Math.PI * 0.5
// floor.castShadow = true
floor.receiveShadow = true
scene.add(floor)

//light
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(0.25, 3, 2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.shadow.mapSize.set(1024,1024)
scene.add(directionalLight)


const clock = new THREE.Clock()

const tick = () => {
    stats.begin()
    
    const elapseTime = clock.getElapsedTime()

    //update mesh
    torusKnot.rotation.y = elapseTime*0.1

    //update controls
    controls.update()

    //renderer
    renderer.render(scene, camera)

    //call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}
tick()

//tip1
// console.log(renderer.info);

//tips2
// scene.remove(cube)
// cube.geometry.dispose()
// cube.material.dispose()

// tips3
// use baked lights or cheap lights
//avoiding add or remove light

// tip4
// shadows is the like lights
// use castShadow and receiveShadow necessary

// renderer.shadowMap.autoUpdate = false
// renderer.shadowMap.needsUpdate =true
//only do the shadow render at first time when the shadow won't move and don't need to update each frame

//tips5
// resize texture
// try to use small texture
// try to use the right format like .jpg or .png to reduce the loading time

//tips6
// use BufferGeometry
//do not update vertices
// mutualize or merge geometry

//instancedMesh

const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
const material = new THREE.MeshNormalMaterial()

const mesh = new THREE.InstancedMesh(geometry, material, 50)
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
scene.add(mesh)

for (let i = 0; i < 50; i++){
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    )

    const quaternion = new THREE.Quaternion()
    quaternion.setFromEuler(new THREE.Euler(
        (Math.random() - 0.5 )* Math.PI * 2,
        (Math.random() - 0.5 )* Math.PI * 2,
        0
    ))
    const matrix = new THREE.Matrix4()
    matrix.makeRotationFromQuaternion(quaternion)
    matrix.setPosition(position)
    mesh.setMatrixAt(i, matrix)
    
    // const mesh = THREE.Mesh(geometry, material)
    // mesh.position.x = (Math.random() - 0.5) * 10
    // mesh.position.y = (Math.random() - 0.5) * 10
    // mesh.position.z = (Math.random() - 0.5) * 10
    // mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
    // mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2
}

// tips7
// draco compression

// Gzip
// a compression happening on the server side

//renderer pixel ratio
// limit the pixel ratio

// tips8
// limit post-processing passes

//shader precision as lower as possible
//avoid use perlin noise but texture
//if possible do the calculation in the vertex shader and send the result to the fragment shader
