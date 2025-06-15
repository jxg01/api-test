<template>
  <div class="">
    <div class="searchTool">
      <div class="searchTool">
        <el-input v-model="suiteStore.searchSuiteName" clearable placeholder="请输入套件名称" class="search-info" />
        <el-button type="primary" @click.stop="suiteStore.fetchSuites" :icon="Search"> 搜索</el-button>
      </div>
      <div>
        <el-button type="primary" @click="openCreateForm" class="addSuite" :icon="Plus"> 新建</el-button>
      </div>
    </div>
    
    <BaseTable
      :columns="tableColumns"
      :table-data="suiteStore.testSuites"
      height="calc(100vh - 295px)"
    >
      <template #testcases="scope">
        <el-tag type="primary" style="background-color:aliceblue; color:darkmagenta;"> {{ scope.row.cases.length }} </el-tag>
      </template>

      <template #operation="scope">
        <el-button link type="primary" size="small" @click.stop="openForm(scope.row)">
          编辑
        </el-button>
        <el-button link type="danger" size="small" @click.stop="deleteSuite(scope.row)">
          删除
        </el-button>
      </template>
    </BaseTable>
    <BasePagination
        v-model:current-page="suiteStore.currentPage"
        v-model:page-size="suiteStore.pageSize"
        :total="suiteStore.total"
        :page-sizes="[5, 10, 20, 50]"
        @page-change="suiteStore.setCurrentPage"
        @size-change="suiteStore.setPageSize"
      />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '../BasePagination.vue'
import { useSuiteStore, type Suite } from '@/stores/suiteStore'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {Search, Plus} from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/project'
const router = useRouter()
const route = useRoute()

// 表格配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'name', label: '套件名称' },
  { prop: 'project_name', label: '所属项目' },
  // { prop: 'description', label: '描述信息' },
  { prop: 'cases', label: '用例数量', width: 135, slot: 'testcases' },
  { prop: 'execution_status', label: '执行状态' },
  { prop: 'created_by', label: '创建人' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

const suiteStore = useSuiteStore()
const projectStore = useProjectStore()

const openForm = async (suite: Suite) => {
  suiteStore.currentSuite = suite
  await suiteStore.fetchCases(projectStore.currentProjectId);
  router.push(`/automation/suite/${suite.id}`)
}

const openCreateForm = (suite: Suite) => {
  router.push('/automation/suite/create')
}

const deleteSuite = async (row: Suite) => {
  try {
    await ElMessageBox.confirm(
      `确定删除套件 "${row.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await suiteStore.removeSuite(Number(row.id))
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 初始化数据
onMounted(async () => {
  if (!projectStore.currentProjectId) {
    await projectStore.initCurrentProject()
  }

  if (projectStore.currentProjectId) {
    console.log('projectStore.currentProjectId => ', projectStore.currentProjectId)
    const projectId = projectStore.currentProjectId
    suiteStore.localProjectId = projectId
    suiteStore.fetchSuites()
  }
})

</script>


<style scoped>
.searchTool {
  display: flex;
  gap: 10px;
  margin: 10px 0;
  justify-content: space-between;
}
.search-info {
  /* width: 20%; */
  min-width: 120px;
  max-width: 160px;
}

.addSuite {
  margin: 10px 10px;
}

</style>