<template>
  <!-- <div class="app-layout"> -->
    <el-container class="app-layout">
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
        
        <el-menu
          :default-active="activeMenu"
          background-color="#2f1b86"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
        >
        <img 
        v-if="logo" 
        :src="logo" 
        class="ban"
        alt="品牌logo"
        >
        <template v-for="route in filteredRoutes" :key="route.path">
          <el-sub-menu v-if="route.children?.length" :index="route.name">
            <template #title>
              <el-icon><component :is="route.meta.icon" /></el-icon>
              <span>{{ route.meta.title }}</span>
            </template>
            <el-menu-item 
              v-for="child in route.children" 
              :key="child.path" 
              :index="`${route.path}/${child.path}`"
            >
              <el-icon><component :is="child.meta.icon" /></el-icon>
              <span>{{ child.meta.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item v-else :index="route.path">
            <el-icon><component :is="route.meta.icon" /></el-icon>
            <span>{{ route.meta.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
      <div class="toggle-button" @click="toggleCollapse">
          <el-icon>
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
    </el-aside>
    <el-container>
      <el-header class="header">
        <base-header />
      </el-header>
      <el-main class="main-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseHeader from '../components/BaseHeader.vue'
import { Fold, Expand, HomeFilled, Setting } from '@element-plus/icons-vue'

const isCollapse = ref(false)
const toggleCollapse = () => {
isCollapse.value = !isCollapse.value
}



const router = useRouter()
const route = useRoute()
const logo = ref<string | null>(import.meta.env.VITE_LOGO_URL)  


const activeMenu = computed(() => {
return route.meta.activeMenu || 
  route.path.split('/').slice(0,3).join('/')
})


// 过滤显示的路由
const filteredRoutes = computed(() => 
  router.getRoutes().filter(v => v.meta.isShow)
)

</script>

<style scoped>
.app-layout {
height: 100vh;
}

/* 左侧菜单 */
.sidebar {
background-color: #2f1b86;
color: white;
position: relative;
}

/* 顶部栏 */
.header {
display: flex;
justify-content: space-between;
align-items: center;
background: #fff;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
padding: 0 20px;
}

/* 标题 */
.platform-title {
font-size: 18px;
font-weight: bold;
}

/* 用户区域 */
.right-header {
display: flex;
align-items: center;
}

/* 主内容区 */
.main-content {
  padding: 20px;
  background: #f3f6f6;
}

.ban {
  height: 80px;
  width: 100%;
}

.toggle-button {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  padding: 15px 0;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.el-menu-item.is-active {
  background-color:rgb(102, 84, 189);
}

</style>
