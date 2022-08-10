import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { SpotLight } from 'three'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
//RectAreaLightHelper不能直接使用，需要引入 why u so special

//GUI
const gui = new dat.GUI()

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

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

const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 32, 32),
    material
)
sphere.position.x = -1.5

const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.75, 0.75, 0.75),
    material
)
cube.rotation.x = Math.PI * 0.5
cube.rotation.y = Math.PI * 0.5

const torus = new THREE.Mesh(
    new THREE.TorusBufferGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(5,5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = -0.65

scene.add(sphere,cube,torus,plane)

//环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)
// gui.add(ambientLight,'intensity').min(0).max(1).step(0.01)

//直射光
const directionLight = new THREE.DirectionalLight(0x00fffc, 0.5)
directionLight.position.set(1, 0.25, 0)
scene.add(directionLight)

//半球光
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)   
scene.add(hemisphereLight) 
//第一个参数的光从顶部往下射，第二个参数的光从底部往上射

// 点光源
const pointLight = new THREE.PointLight(0xff9000, 0.5, 10)
//第三个参数是光照距离
pointLight.position.set(1, -0.5, 1)
scene.add(pointLight)

//矩形光
const rectAreaLight = new THREE.RectAreaLight(0x4e000ff, 2, 1, 1)
// 第二个参数是强度，后两个为矩形宽高
// 只作用于MeshStandardMaterial和MeshPhysicalMaterial
rectAreaLight.position.set(-1.5, 0, 1.5)
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

//聚光灯
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1)
//参数 ：强度 距离 角度 边缘锐化 渐弱
spotLight.position.set(0, 2, 3)
scene.add(spotLight)
// spotlight的target是一个3d对象，需要将它添加到场景中并改变它的position，直接修改spotlight的position是没用的
spotLight.target.position.x = -0.75
scene.add(spotLight.target)

//灯光非常消耗性能so不要往场景里加太多的灯光
// ambientLight,hemisphereLight dont cost lot it's ok
// directionLight,pointLight 也还可以
// spotLight,rectAreaLight  cost HIGHHHH not too much

// use helpers, help to position light
// const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.1)
// //第二个参数是辅助对象的大小
// scene.add(hemisphereLightHelper)

// const directionLightHelper = new THREE.DirectionalLightHelper(directionLight, 0.1)
// scene.add(directionLightHelper)

// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.1)
// scene.add(pointLightHelper)

// const spotLightHelper = new THREE.SpotLightHelper(spotLight)
// scene.add(spotLightHelper)

// //改变了spotlight的position但它的helper却没有更新 so在下一帧更新helper
// window.requestAnimationFrame(() => {
//     spotLightHelper.update()
// })

// const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
// scene.add(rectAreaLightHelper)
// //蒽。。rectAreaLightHelper也不会自动更新位置而且比spotLightHelper还要笨
// window.requestAnimationFrame(() => {
//     // rectAreaLightHelper.position.x = rectAreaLight.position.x  
//     // rectAreaLightHelper.position.y = rectAreaLight.position.y  
//     // rectAreaLightHelper.position.z = rectAreaLight.position.z  
//     // 上面这么写看起来很笨，use position的copy方法
//     rectAreaLightHelper.position.copy(rectAreaLight.position)
//     rectAreaLightHelper.quaternion.copy(rectAreaLight.quaternion) //更新旋转角度
//     spotLightHelper.update()
// })

const k = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(75, k,0.1,100)
camera.position.set(2, 3, 4)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
//增加阻尼
controls.enableDamping = true


var renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(sizes.width, sizes.height);


const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()
    sphere.rotation.y = 0.1 * elapseTime
    cube.rotation.y = 0.1 * elapseTime
    torus.rotation.y = 0.1 * elapseTime

    sphere.rotation.x = 0.2 * elapseTime
    cube.rotation.x = 0.2 * elapseTime
    torus.rotation.x = 0.2 * elapseTime

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()