/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-12 09:20:58
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-05-02 14:17:54
 * @FilePath: \passengerInfoSearch\web\vite.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  server: {
    host: '10.86.255.9',
    // host: 'localhost',
    port: 8080,
    open: true,
    base: './',
    proxy: {
      '/api/statistics': {
        target: 'http://10.33.160.31',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/flight/baggage': {
        target: 'http://10.86.255.9:8081',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/api': {
        target: 'http://10.86.255.9:3001',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
})
