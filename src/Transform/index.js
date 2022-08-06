import * as THREE from 'three';

/**
 * 创建场景对象Scene
 */
var scene = new THREE.Scene();
/**
 * 创建网格模型
 */
// // var geometry = new THREE.SphereGeometry(60, 40, 40); //创建一个球体几何对象
// var geometry = new THREE.BoxGeometry(1, 1, 1); //创建一个立方体几何对象Geometry
// var material = new THREE.MeshLambertMaterial({
//   color: 0x0000ff
// }); //材质对象Material
// var mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
// scene.add(mesh); //网格模型添加到场景中

// // mesh.position.x = 1
// // mesh.position.y = 0
// // mesh.position.z = -1
// mesh.position.set(1, 0, -2)
// //到scene中心的距离
// // console.log(mesh.position.length());


//Group
const group = new THREE.Group()
group.position.y = 0
group.scale.y = 0.5
group.rotation.y = 1
scene.add(group)
const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0x00FF00 })
)
cube1.position.set(2,0,0)
group.add(cube1)

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0x00FFFF })
)
cube2.position.set(0,2,0)
group.add(cube2)

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0xFFFF00 })
)
cube3.position.set(0,0,2)
group.add(cube3)

/**
 * 坐标系
 */
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)
//red =>x  green=>y blue=>z

//scale
// mesh.scale.x = 2
// mesh.scale.y = 0.5
// mesh.scale.z = 0.5
// mesh.scale.set(2, 0.5, 0.5)

//rotation
// mesh.rotation.reorder('YXZ')
//坐标轴会跟着旋转
// mesh.rotation.y = Math.PI / 4
// mesh.rotation.x = Math.PI / 4
//弧度制

/**
 * 光源设置
 */
//点光源
var point = new THREE.PointLight(0xffffff);
point.position.set(4, 2, 3); //点光源位置
scene.add(point); //点光源添加到场景中
//环境光
var ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);
// console.log(scene)
// console.log(scene.children)

/**
 * 相机设置
 */
var width = window.innerWidth; //窗口宽度
var height = window.innerHeight; //窗口高度
var k = width / height; //窗口宽高比
var s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
//创建相机对象
var camera = new THREE.PerspectiveCamera(75,k)
camera.position.set(5, 5, 5); //设置相机位置
// camera.lookAt(mesh.position); //设置相机方向
camera.lookAt(new THREE.Vector3(0,1,0));
scene.add(camera)
//到相机的距离
// console.log(mesh.position.distanceTo(camera.position));

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
// 渲染函数
function render() {
  renderer.render(scene,camera);//执行渲染操作
}
render();
