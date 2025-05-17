<template>
    <div>
        <el-tabs
        v-model="store.activeTabId"
        type="card"
        closable
        @tab-remove="store.removeTab"
        editable
        @edit="handleTabsEdit"
        class="demo-tabs"
        >
          <template #add-icon>
            <el-icon><Delete/></el-icon>
          </template>
          <el-tab-pane
              v-for="tab in store.tabs"
              :key="tab.id"
              :name="tab.id"
              :label="tab.label"
          >
              <ApiDetail :detail="tab.detail" />
          </el-tab-pane>
        </el-tabs>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useInterfaceStore } from '@/stores/interface'
  import ApiDetail from '@/components/interface/ApiDetail.vue'
  import { Delete } from '@element-plus/icons-vue'

  const store = useInterfaceStore()

// 新增：关闭全部标签页
const handleCloseAll = () => {
  store.tabs.forEach(tab => {
    store.removeTab(tab.id)
  })
  store.activeTabId = null
}

const handleTabsEdit = (targetName: any | undefined, action: 'remove' | 'add') => {
  try{
    if (action === 'remove') {
      if (store.selectedProjectId){
        store.fetchModules(store.selectedProjectId)
      }
    }
    else if (action === 'add') {
      handleCloseAll()
    }
  } catch (error) {
    console.error('Error in handleTabsEdit:', error)
  }
}

  </script>

  <style scoped>

</style>
  
