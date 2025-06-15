<template>
    <!-- <div class="app-layout"> -->
      <el-container class="app-layout">
        <el-aside width="200px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            background-color="#2f1b86"
            text-color="#fff"
            active-text-color="#ffd04b"
            router
            :unique-opened="true"
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
  /* padding: 20px; */
  /* background: #f5f7fa; */
}

.ban {
  height: 80px;
  width: 100%;
}

  </style>
  