import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      resolvers: [
        // 自动导出 element plus 组件
        ElementPlusResolver(), 
        // 自动导入 icon
        IconsResolver({prefix: 'Icon'}),
      ]
    }),
    
    Components({
      resolvers: [
        ElementPlusResolver(), 
        IconsResolver({enabledCollections: ['ep']})
      ],
    }),

    Icons({
      autoInstall: true,
    }),
  ],
  optimizeDeps: {
    include: ['element-plus/es/components/container/style/css'] // 显式包含问题组件:ml-citation{ref="2" data="citationList"}
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
