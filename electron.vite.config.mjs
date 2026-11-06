import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: { '@': resolve('src/renderer/src') }
    },
    plugins: [vue()],
    // 编辑器/工具做原子保存时会先落一个临时文件再改名，
    // 若把临时文件也纳入监听，watcher 会因文件已被删掉而抛 EBUSY 并退出进程
    server: {
      watch: { ignored: ['**/*.tmp', '**/*.tmpdir/**', '**/.~*'] }
    }
  }
})
