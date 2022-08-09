import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

//GUI
const gui = new dat.GUI()

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const woodTexture = textureLoader.load('/textures/wood.jpg')
const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/1/px.png',    //正x轴图片
    '/textures/environmentMaps/1/nx.png',    //负x轴图片
    'textures/environmentMaps/1/py.png',    //正y轴图片
    '/textures/environmentMaps/1/ny.png',    //负y轴图片
    '/textures/environmentMaps/1/pz.png',    //正z轴图片
    '/textures/environmentMaps/1/nz.png',    //负z轴图片
])



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

// const material = new THREE.MeshBasicMaterial()
// material.map = woodTexture
// material.color.set('#8effff')
// material.color = new THREE.Color(0x8effff)
// material.wireframe = true
// material.opacity = 0.5
// material.transparent = true //设置后才能修改opacity

// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true //平面着色

// const material = new THREE.MeshDepthMaterial()

// const material = new THREE.MeshLambertMaterial()
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100 //反射光强度
// material.specular = new THREE.Color(0x00ffff)   // 反射光颜色

// const material = new THREE.MeshToonMaterial()   //很卡通 可爱捏

// const material = new THREE.MeshStandardMaterial()
//just like MeshLambertMaterial and MeshPhongMaterial
// material.metalness = 0.45 //金属性
// material.roughness = 0.65 //粗糙度
// material.map = woodTexture
// material.aoMap = ambientOcclusionTexture //一张对应纹理阴影的贴图，增加纹理对比度，但是我没有
// material.aoMapIntensity = 1 //阴影暗度
// material.displacementMap = heightTexture //一张对应纹理高度的贴图
// material.displacementScale = 0.05    //高度
// material.metalnessMap = metalnessTexture    //金属性
// material.roughnessMap = roughnessTexture    //粗糙度
//和material.metalness material.roughness作用相同
// material.normalMap = normalTexture      //法线贴图
// material.normalScale.set(0.5, 0.5)
// material.transparent = true
// material.alphaMap = alphaTexture    //透明度贴图

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.7 //金属性
material.roughness = 0.2 //粗糙度
material.envMap = environmentMapTexture

gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)
// gui.add(material, 'aoMapIntensity').min(0).max(1).step(0.0001)
// gui.add(material, 'displacementScale').min(0).max(1).step(0.0001)

const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 64, 64),
    material
)
sphere.position.x = -1.5
sphere.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))

const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1, 1, 100, 100),
    material
)
plane.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))
    
const torus = new THREE.Mesh(
    new THREE.TorusBufferGeometry(0.3, 0.15, 64, 128),
    material
)
torus.position.x = 1.5
torus.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))

scene.add(sphere,plane,torus)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
scene.add(pointLight)

const k = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(75, k,0.1,100)
// const camera = new THREE.OrthographicCamera(-1*k, 1*k, 1, -1, 0.1, 100)
camera.position.set(0, 0, 3)
// camera.lookAt(mesh.position)
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
    const elapseTime = clock.getElapsedTime()
    sphere.rotation.y = 0.1 * elapseTime
    plane.rotation.y = 0.1 * elapseTime
    torus.rotation.y = 0.1 * elapseTime

    sphere.rotation.x = 0.2 * elapseTime
    plane.rotation.x = 0.2 * elapseTime
    torus.rotation.x = 0.2 * elapseTime

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()