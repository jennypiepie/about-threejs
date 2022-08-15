import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


// 1.使用light中内置的shadow2.将阴影纹理直接渲染在平面上3.创建一个shadow平面跟随物体移动

// 使用texture渲染阴影
// const textureLoader = new THREE.TextureLoader()
// const bakedShadow = textureLoader.load('/textures/bakedShadow.jpg')
// const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg') //并没有这两张阴影纹理的图片


//GUI
const gui = new dat.GUI()

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 32, 32),
    material
)
//默认为false
// step2:
sphere.castShadow = true

const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(5,5),
    material

    //if want to use bakedShadow
    //将阴影纹理直接渲染在平面上，但是当物体移动时，阴影不会跟着移动
    // new THREE.MeshBasicMaterial({
    //     map:bakedShadow
    // })
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = -0.5
// step3:
plane.receiveShadow = true

scene.add(sphere, plane)

//创建shadow平面
const sphereShadow = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1.5,1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        // alphaMap:simpleShadow
    })
)
sphereShadow.rotation.x = -Math.PI * 0.5
//需要将此屏幕稍微抬高一点，不然gpu不知道哪一块在上面，then they will fighting
sphereShadow.position.y = plane.position.y + 0.01
scene.add(sphereShadow)

// only three light support shadows:pointlight,directionlight spotlight
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)
const directionLight = new THREE.DirectionalLight(0xffffff, 0.3)
directionLight.position.set(2, 2, -1)
scene.add(directionLight)
// step4:
directionLight.castShadow = true
// 设置shadow属性in here
directionLight.shadow.mapSize.width = 1024
directionLight.shadow.mapSize.height = 1024     //设置shadow分辨率
directionLight.shadow.camera.right = 2
directionLight.shadow.camera.left = -2
directionLight.shadow.camera.top = 2
directionLight.shadow.camera.bottom = -2 //shadow camera 的截面大小
directionLight.shadow.camera.near = 1
directionLight.shadow.camera.far = 6    //  shadow camera的远近截面
directionLight.shadow.radius = 10   //  shadow模糊度

const directionLightCameraHelper = new THREE.CameraHelper(directionLight.shadow.camera)
directionLightCameraHelper.visible = false
scene.add(directionLightCameraHelper)


//spotLight
const spotLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3)
spotLight.castShadow = true
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024 
spotLight.shadow.camera.fov = 30 //角度(角度越大视野越大)
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 5 //  远近截面

spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)

//pointLight
const pointLight = new THREE.PointLight(0xffffff,0.3)
pointLight.castShadow = true
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.camera.near = 1
pointLight.shadow.camera.far = 5

pointLight.position.set(-1, 1, 0)
scene.add(pointLight)

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)

const k = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(75, k,0.1,100)
camera.position.set(1,1,3)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
//增加阻尼
controls.enableDamping = true


var renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(sizes.width, sizes.height);
// step1:
renderer.shadowMap.enabled = false
renderer.shadowMap.type = THREE.PCFSoftShadowMap  //shadow.radius会失效

const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()
    //球体动画
    sphere.position.x = Math.cos(elapseTime) * 1.5
    sphere.position.z = Math.sin(elapseTime) * 1.5
    sphere.position.y = Math.abs(Math.sin(elapseTime * 3))
    
    //阴影动画
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    //根据球体距离平面的高度改变阴影的透明度
    sphereShadow.material.opacity = (1- sphere.position.y)*0.3

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()