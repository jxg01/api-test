<template>
  <!-- <div class="searchTool" v-show="store.activeTab === 'list'"> -->
  <div class="searchTool">
    <el-select
      v-model="store.searchSelectProjectId"
      placeholder="选择项目"
      @change="handleProjectChange"
      class="search-info"
    >
      <el-option
        v-for="project in interfaceStore.projects"
        :key="project.id"
        :label="project.name"
        :value="project.id"
      />
    </el-select>
    <el-select
      v-model="store.searchInterfaceId"
      placeholder="选择接口"
      class="search-info"
      filterable
      clearable
    >
      <el-option
        v-for="api in store.interFaceList"
        :key="api.id"
        :label="api.name"
        :value="api.id"
      />
    </el-select>

    <el-input v-model="store.searchInput" clearable placeholder="请输入用例名称" class="search-info" />
    <el-button type="primary" @click.stop="store.fetchCaseList">搜索</el-button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useCaseStore } from '@/stores/testcase'
import { useInterfaceStore } from '@/stores/interface'
import { interfaceApi } from '@/api'

const store = useCaseStore()
const interfaceStore = useInterfaceStore()


onMounted(() => {
  interfaceStore.fetchProjects()
})


// 项目切换处理
const handleProjectChange = async(projectId: number) => {
  // 获取当前项目的模块数据 
  try {
    const res = await interfaceApi.getInterfaceList({'project_id': projectId})
    if (res) {
      store.interFaceList = res.data
    }
    store.searchInterfaceId = ''
  } catch (error) {
    console.error('in project change => ', error)
  }
}

// 切换 接口 下拉框 回调
const handleApiChange = async(interface_id: number) => {

}


</script>


<style scoped>
.searchTool {
  display: flex;
}
.search-info {
  /* width: 20%; */
  min-width: 120px;
  max-width: 160px;
}


</style>

