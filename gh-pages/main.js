import * as THREE from 'https://cdn.skypack.dev/three@0.158.0'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.158.0/examples/jsm/controls/OrbitControls.js'

// 简化演示：创建一个地图画布
const canvas = document.getElementById('map')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 0, 20)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

function animate() {
  requestAnimationFrame(animate)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  controls.update()
  renderer.render(scene, camera)
}
animate()