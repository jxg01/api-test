<template>
    <div class="interface-container">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <ProjectSelector />
        <InterfaceTree />
      </div>
      
      <!-- 右侧面板 -->
      <div class="right-panel">
        <InterfaceTabs />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue'
  import { useInterfaceStore } from '@/stores/interface'
  import ProjectSelector from '@/components/interface/ProjectSelector.vue'
  import InterfaceTree from '@/components/interface/InterfaceTree.vue'
  import InterfaceTabs from '@/components/interface/InterfaceTabs.vue'
  
  const store = useInterfaceStore()
  
  // 初始化加载项目列表
  onMounted(() => {
    store.fetchProjects()
  })
  </script>
  
  <style scoped>
  .interface-container {
    display: flex;
    /* height: 100vh; */
    overflow: hidden;
  }
  
  .left-panel {
    width: 400px;
    border-right: 1px solid var(--el-border-color);
    display: flex;
    flex-direction: column;

    height: 100%;

  }
  
  .right-panel {
    flex: 1;
    min-width: 0;
  }


  </style>