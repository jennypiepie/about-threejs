import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


//GUI
const gui = new dat.GUI()

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

const texturesLoader = new THREE.TextureLoader()
const particleTexture  = texturesLoader.load('/textures/particles/1.png')

const particlesGeometry = new THREE.BufferGeometry()
const count = 5000
const positions = new Float32Array(count * 3) //array like[x,y,z,x,y,z...]
const colors = new Float32Array(count * 3)   //array like [r,g,b,r,g,b...]


for (let i = 0; i < count * 3; i++){
    positions[i] = (Math.random() - 0.5) * 10
    colors[i] = Math.random()
}
particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions,3)
)

particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors,3)
)

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.1   //粒子大小
particlesMaterial.sizeAttenuation = true    //近大远小
// particlesMaterial.color = new THREE.Color('#00ffff')
// particlesMaterial.map = particleTexture //黑色背景不透明
particlesMaterial.transparent = true
particlesMaterial.alphaMap = particleTexture
//仍然会有粒子被前面的黑色背景遮挡，因为当gpu检测到当前部分的alpha是0时，它就什么都不画（但是渲染了）
// particleTexture.alphaTest = 0.01
//第一种解决办法：让gpu对alpha是0的部分什么都不做，也不要渲染
// particlesMaterial.depthTest = false
// 第二种：depthTest会根据粒子前面是否有别的东西遮挡决定是否绘制
particlesMaterial.depthWrite = false
//第三种：不把粒子写入depth buffer（缓冲区？
particlesMaterial.blending = THREE.AdditiveBlending
//叠加的越多就越亮
particlesMaterial.vertexColors = true

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)


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

const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()

    // particles.rotation.y  = elapseTime * 0.02
    // particles.position.y = -elapseTime * 0.02

    //可以这么做，但是对电脑来说遍历每一个粒子(如果特别多的话) really a bad idea
    for (let i = 0; i < count; i++){
        const i3 = i * 3   //x:i3+0 y:i3+1 z:i3+2

        const x = particlesGeometry.attributes.position.array[i3]
        particlesGeometry.attributes.position.array[i3+1] = Math.sin(elapseTime+x)
    }

    particlesGeometry.attributes.position.needsUpdate = true
    //如果要改变attributes的值得通知一下threejs这个需要更新
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()