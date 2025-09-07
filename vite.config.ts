import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path';
import { fileURLToPath, URL } from 'url';

// 为ES模块创建等效的__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    include: ['element-plus/es/components/container/style/css']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  define: {
    // 明确设置Vue特性标志以避免控制台警告
    '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': false
  }
})
