import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene()

// const axesHelper = new THREE.AxesHelper(10)
// scene.add(axesHelper)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/3.png')

const fontLoader = new THREE.FontLoader()

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new THREE.TextBufferGeometry(
            'JennyPiePie',
            {
                font,
                size: 0.5,
                height: 0.2,
                curveSegments: 6,  //曲线段
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4   //斜角
            }
        )
        // 1.移动geometry来居中
        // textGeometry.computeBoundingBox()   //  边界盒子
        // textGeometry.translate(
        //     - (textGeometry.boundingBox.max.x -0.02) * 0.5,
        //     - (textGeometry.boundingBox.max.y -0.02) * 0.5,
        //     - (textGeometry.boundingBox.max.y -0.03) * 0.5 
        // )
        
        // 2.直接使用center方法
        textGeometry.center()

        const Material = new THREE.MeshMatcapMaterial({ matcap:matcapTexture })
        const text = new THREE.Mesh(textGeometry, Material)
        scene.add(text)


        const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)
        // const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
        //创建几何体和材质放在循环外，优化渲染时间
        for (let i = 0; i < 100; i++){
            
            const donut = new THREE.Mesh(donutGeometry, Material)
            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10

            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            const scale = Math.random()
            donut.scale.set(scale,scale,scale)

            scene.add(donut)
        }
    }
)


const k = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(75, k,0.1,100)
camera.position.set(0, 0, 3)
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
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()