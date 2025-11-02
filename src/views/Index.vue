<template>
  <!-- <div class="app-layout"> -->
    <el-container class="app-layout">
      <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
        <img 
          v-if="logo" 
          :src="logo" 
          class="ban"
          alt="品牌logo"
          >
        <!-- 菜单内容区域 - 可滚动 -->
        <div class="menu-container">
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
                <!-- 添加可选链操作符确保类型安全 -->
                <el-icon><component :is="child.meta?.icon" /></el-icon>
                <span>{{ child.meta?.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            
            <el-menu-item v-else :index="route.path">
              <el-icon><component :is="route.meta.icon" /></el-icon>
              <span>{{ route.meta.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
        </div>
        <!-- 收缩按钮 - 固定在底部 -->
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
        <!-- 添加:key="$route.fullPath"确保二级菜单切换时也重新创建组件，清除所有状态 -->
        <RouterView :key="$route.fullPath" />
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
height: 100%;
display: flex;
flex-direction: column;
}

/* 菜单容器 - 可滚动 */
.menu-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
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

/* 收缩按钮 - 固定在底部 */
.toggle-button {
  width: 100%;
  text-align: center;
  padding: 15px 0;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.3s;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 自定义滚动条样式 */
.menu-container::-webkit-scrollbar {
  width: 6px;
}

.menu-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.menu-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.el-menu-item.is-active {
  background-color:rgb(102, 84, 189);
}

</style>
