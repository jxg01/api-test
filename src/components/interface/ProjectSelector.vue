<template>
    <div class="project-selector">
      <!-- 项目选择下拉框 -->
      <el-select
        v-model="store.selectedProjectId"
        placeholder="选择项目"
        @change="handleProjectChange"
        size="large"
        class="project-select"
      >
        <el-option
          v-for="project in store.projects"
          :key="project.id"
          :label="project.name"
          :value="project.id"
        />
      </el-select>
  
      <!-- 搜索和添加按钮 -->
      <div class="search-add">
        <el-button type="primary" :icon="Plus" circle @click="handleAdd" />
        <el-input
          v-model="store.searchText"
          placeholder="搜索接口"
          clearable
          size="large"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { useInterfaceStore } from '@/stores/interface'
  
  const store = useInterfaceStore()
  
  // 项目切换处理
  const handleProjectChange = (projectId: number) => {
    console.log('Project changed:', projectId)
    console.log('Fetching modules for project:', store.selectedProject)
    store.fetchModules(projectId)
  }
  
  // 添加按钮处理
  const handleAdd = () => {
    // 添加新接口逻辑
  }
  </script>
  
  <style scoped>
  .project-selector {
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
  }

  .project-select {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .search-add {
    margin-top: 10px;
    display: flex;
    gap: 5px;
    align-items: center;
    width: 100%;
  }
  </style>