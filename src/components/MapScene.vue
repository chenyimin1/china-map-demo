<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { createTileLayer } from './TileLayer'
import chinaGeoJson from '../china-provinces.json'
import { pointInPolygon } from '../utils/geoFilter'

const canvas = ref()

onMounted(() => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value })
  renderer.setSize(window.innerWidth, window.innerHeight)

  // 坐标转换比例（天地图瓦片以瓦片为单位，这里人为缩放比例）
  const scale = 1

  camera.position.set(0, 0, 20)

  // 加载天地图
  const key = '7c230f7eb0a7f66c7ee2db16628e8441'
  createTileLayer(scene, key, 'vec')

  // 鼠标控制
  const controls = new THREE.OrbitControls(camera, renderer.domElement)

  // 渲染省份边界
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffaa00 })
  chinaGeoJson.features.forEach(feature => {
    const { coordinates } = feature.geometry
    const group = new THREE.Group()

    coordinates.forEach(poly => {
      poly.forEach(ring => {
        const points = ring.map(([lng, lat]) => {
          return new THREE.Vector3(lng / 10, lat / 10, 0)
        })
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(geometry, lineMaterial)
        group.add(line)
      })
    })

    group.userData = { name: feature.properties.name }
    scene.add(group)
  })

  // 添加 10000 点位（使用 InstancedMesh）
  const instanceGeometry = new THREE.SphereGeometry(0.1, 8, 8)
  const instanceMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })
  const count = 10000
  const mesh = new THREE.InstancedMesh(instanceGeometry, instanceMaterial, count)
  const dummy = new THREE.Object3D()
  const colors = []

  let index = 0
  while (index < count) {
    const x = Math.random() * 20 - 10
    const y = Math.random() * 20 - 10
    const inside = chinaGeoJson.features.some(feature => {
      return feature.geometry.coordinates.some(poly =>
        poly.some(ring => pointInPolygon([x * 10, y * 10], ring))
      )
    })
    if (inside) {
      dummy.position.set(x, y, 0.1)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)

      const color = new THREE.Color(Math.random(), Math.random(), Math.random())
      colors.push(color.r, color.g, color.b)
      index++
    }
  }

  const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(colors), 3)
  mesh.geometry.setAttribute('color', colorAttr)
  scene.add(mesh)

  // 射线拾取变色
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  window.addEventListener('click', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObject(mesh)
    if (intersects.length > 0) {
      const id = intersects[0].instanceId
      const newColor = new THREE.Color(1, 0, 0)
      colorAttr.setXYZ(id, newColor.r, newColor.g, newColor.b)
      colorAttr.needsUpdate = true
    }
  })

  // 省份 tooltip
  const tooltip = document.createElement('div')
  tooltip.style.position = 'fixed'
  tooltip.style.pointerEvents = 'none'
  tooltip.style.background = 'rgba(0,0,0,0.6)'
  tooltip.style.color = '#fff'
  tooltip.style.padding = '4px 8px'
  tooltip.style.borderRadius = '4px'
  tooltip.style.display = 'none'
  document.body.appendChild(tooltip)

  window.addEventListener('mousemove', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    let found = false
    scene.children.forEach(child => {
      if (child.userData.name) {
        child.children.forEach(line => {
          const intersects = raycaster.intersectObject(line)
          if (intersects.length > 0 && !found) {
            tooltip.innerText = child.userData.name
            tooltip.style.left = event.clientX + 5 + 'px'
            tooltip.style.top = event.clientY + 5 + 'px'
            tooltip.style.display = 'block'
            found = true
          }
        })
      }
    })

    if (!found) tooltip.style.display = 'none'
  })

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()
})
</script>

<style>
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>