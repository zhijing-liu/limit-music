import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../public/static'
  },
  server: {
    port: 10001,
    host: true,
    proxy: {
      '/action': 'http://127.0.0.1:10000/',
      '/socket.io': 'http://127.0.0.1:10000/'
    }
  },
  base: '/controller/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
