// 仅在浏览器中预览界面（不启动 Electron，接口自动走 mock）
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: resolve('src/renderer'),
  resolve: {
    alias: { '@': resolve('src/renderer/src') }
  },
  plugins: [vue()],
  server: { port: 5173 }
})
