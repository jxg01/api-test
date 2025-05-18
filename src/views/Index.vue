<template>
    <div class="main-wrapper">
      <el-header class="header">
        <BaseHeader  />
      </el-header>

        <el-aside width="200px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            active-text-color="#ffd04b"
            background-color="#545c64"
            text-color="#fff"
            router
            :unique-opened="true"
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
  
        <div class="content-wrapper">
          <div class="scroll-container">
            <el-main class="scroll-main">
              <RouterView />
            </el-main>
            <el-footer class="footer">
              © 2025 Lifebyte
            </el-footer>
          </div>
        </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import BaseHeader from '../components/BaseHeader.vue'

  const router = useRouter()
  const route = useRoute()

  // 优化后的激活菜单计算
  const activeMenu = computed(() => {
    // 获取当前匹配的路由记录
    const matched = route.matched
    return matched[matched.length - 1]?.path || '/'
  })
  
  // 过滤显示的路由
  const filteredRoutes = computed(() => 
    router.getRoutes().filter(v => v.meta.isShow)
  )

  </script>
  
  <style scoped>
  .main-wrapper {
    position: relative;
    height: 100vh;
    overflow: hidden;
}
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #d6c8ed;
    z-index: 1000;
    padding: 0;
}

.sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    width: 200px;
    background: #545c64 url('../assets/bg3.jpg');
    background-size: cover;
    background-blend-mode: multiply;
    z-index: 999;
}

.content-wrapper {
  margin: 60px 0 0 200px;
  height: calc(100vh - 60px); /* 修改为固定高度 */
  display: flex; /* 新增 */
  flex-direction: column; /* 新增 */
}

.scroll-container {
    flex: 1;
    min-height: 0; /* 修复flex容器滚动问题 */
    display: flex;
    flex-direction: column;
}

.scroll-main {
    overflow-y: auto;
    max-height: calc(100vh - 120px); /* 60px header + 60px footer */
    padding: 20px;
}

.footer {
  flex-shrink: 0; 
  height: 60px;
  background: #e9eef3;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #dcdfe6;
  color: #545c64;
}
  </style>
  