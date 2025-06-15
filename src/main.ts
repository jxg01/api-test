import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
// import store from './stores/user'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css';
import { useProjectStore } from '@/stores/project'


const app = createApp(App)
const pinia = createPinia()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(router)
.use(pinia)
.mount('#app')

const store = useProjectStore()
await store.initCurrentProject()

