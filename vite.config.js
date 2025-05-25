import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/china-map-demo/',  // 👈 设置为你的仓库名称
  plugins: [vue()]
})
