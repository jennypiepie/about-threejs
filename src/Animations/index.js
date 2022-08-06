import * as THREE from 'three';
import gsap from 'gsap'
/**
 * 创建场景对象Scene
 */
var scene = new THREE.Scene();
/**
 * 创建网格模型
 */
var mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0x0000ff })
); //网格模型对象Mesh
scene.add(mesh); //网格模型添加到场景中
mesh.position.set(1, 0, -2)

//点光源
var point = new THREE.PointLight(0xffffff);
point.position.set(4, 2, 3); //点光源位置
scene.add(point); //点光源添加到场景中
//环境光
var ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);

/**
 * 相机设置
 */
var width = window.innerWidth; //窗口宽度
var height = window.innerHeight; //窗口高度
var k = width / height; //窗口宽高比
var s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
//创建相机对象
var camera = new THREE.PerspectiveCamera(45,k)
camera.position.set(5, 5, 5); //设置相机位置
camera.lookAt(new THREE.Vector3(0,0,0));
scene.add(camera)

/**
 * 创建渲染器对象
 */
const canvas = document.querySelector('.webgl')
var renderer = new THREE.WebGLRenderer({
    canvas
});
renderer.setSize(width, height);//设置渲染区域尺寸
renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
//执行渲染操作   指定场景、相机作为参数

// let time = Date.now()
// const clock = new THREE.Clock()

gsap.to(mesh.position, { duration: 1, delay: 0, x: 2 })
gsap.to(mesh.position, { duration: 1, delay: 2, x: 0 })
const tick = () => {
    // //time
    // // 使用原生js方法
    // const currentTime = Date.now()
    // const deltaTime = currentTime - time
    // time = currentTime
    // // console.log(deltaTime);
    // // mesh.position.x += 0.01
    // mesh.rotation.y += 0.001*deltaTime //无论帧率如何，都以相同的速度旋转
    
    //使用内置Clock方法
    // const elapsedTime = clock.getElapsedTime()
    // // console.log(elapsedTime);
    // // mesh.rotation.y = elapsedTime
    // // mesh.position.y = Math.sin(elapsedTime)
    // // mesh.position.x = Math.cos(elapsedTime)
    // camera.position.y = Math.sin(elapsedTime)
    // camera.position.x = Math.cos(elapsedTime)
    // camera.lookAt(mesh.position)
    renderer.render(scene, camera);//执行渲染操作
    window.requestAnimationFrame(tick)
}
tick()


