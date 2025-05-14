<template>
    <div>
        <el-tabs
        v-model="store.activeTabId"
        type="card"
        closable
        @tab-remove="store.removeTab"
        >
            <el-tab-pane
                v-for="tab in store.tabs"
                :key="tab.id"
                :name="tab.id"
                :label="tab.label"
            >
                <ApiDetail :detail="tab.detail" @save="handleSave" />
            </el-tab-pane>
        </el-tabs>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useInterfaceStore } from '@/stores/interface'
  import ApiDetail from '@/components/interface/ApiDetail.vue'
  
  const store = useInterfaceStore()
  
  // 保存接口详情
  const handleSave = (detail: any) => {
    console.log('Saving detail:', detail)
    const currentTab = store.tabs.find(t => t.id === store.activeTabId)
    if (currentTab) {
      currentTab.detail = detail
      // 调用API保存接口
      interfaceApi.updateInterfaceDetail(currentTab.id, detail)
    }
  }




  </script>