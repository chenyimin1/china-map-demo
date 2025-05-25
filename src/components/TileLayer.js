// 天地图瓦片图层加载器
import * as THREE from 'three'

export function createTileLayer(scene, key, type = 'vec') {
  const baseUrls = {
    vec: `https://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${key}`,
    img: `https://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${key}`
  }

  const urlTemplate = baseUrls[type]
  const group = new THREE.Group()

  const zoom = 5
  const tileCount = Math.pow(2, zoom)

  for (let x = 0; x < tileCount; x++) {
    for (let y = 0; y < tileCount; y++) {
      const url = urlTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', zoom).replace('{s}', 1)
      const texture = new THREE.TextureLoader().load(url)
      const material = new THREE.MeshBasicMaterial({ map: texture })
      const geometry = new THREE.PlaneGeometry(1, 1)
      const tile = new THREE.Mesh(geometry, material)
      tile.position.set(x - tileCount / 2, tileCount / 2 - y, 0)
      group.add(tile)
    }
  }

  scene.add(group)
  return group
}