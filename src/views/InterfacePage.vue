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
  import { useCaseStore } from '@/stores/testcase'
  import { variableApi } from '@/api'
  
  const store = useInterfaceStore()
  const testCaseStore = useCaseStore()
  
  
  // 初始化加载项目列表
  onMounted(() => {
    store.fetchProjects()
    fetchPythonNameList()
  })


// 初始化数据 python 方法联想
const fetchPythonNameList = async () => {
  try {
    const response = await variableApi.getPythonFunctionNameList()
    testCaseStore.pythonFunctionList = response.data || []
  } catch (error) {
    console.error('获取 Python 名称列表失败:', error)
  }
}

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