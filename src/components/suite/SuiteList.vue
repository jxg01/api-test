<template>
  <div class="suit-page">
    <div class="searchTool">
      <div class="left-search">
        <el-input v-model="suiteStore.searchSuiteName" clearable placeholder="请输入套件名称" />
        <el-button type="primary" @click.stop="suiteStore.fetchSuites" :icon="Search"> 搜索</el-button>
      </div>
      <div>
        <el-button type="primary" @click="openCreateForm" class="addSuite" :icon="Plus"> 新建</el-button>
      </div>
    </div>
    
    <BaseTable
      :columns="tableColumns"
      :table-data="suiteStore.testSuites"
      :height="'calc(100vh - 215px)'"
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
import { useProjectChangeListener } from '@/composables/useProjectChangeListener'
const router = useRouter()
const route = useRoute()

// 表格配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'name', label: '套件名称' },
  // { prop: 'project_name', label: '所属项目' },
  // { prop: 'description', label: '描述信息' },
  { prop: 'cases', label: '用例数量', width: 135, slot: 'testcases' },
  { prop: 'execution_status', label: '最近执行' },
  { prop: 'created_by', label: '创建人' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

const suiteStore = useSuiteStore()
const projectStore = useProjectStore()

// 刷新套件数据
async function refreshSuiteData(projectId: number | string) {
  try {
    suiteStore.localProjectId = Number(projectId)
    await suiteStore.fetchSuites()
  } catch (error) {
    console.error('刷新套件数据失败:', error)
  }
}

// 整合初始化数据逻辑，包括重试机制
async function initDataWithRetry(projectId: number | string) {
  try {
    await refreshSuiteData(projectId);
  } catch (error) {
    console.error('首次加载数据失败，将重试:', error);
    // 首次加载失败，尝试重试一次
    setTimeout(async () => {
      if (projectStore.currentProjectId) {
        try {
          await refreshSuiteData(projectId);
        } catch (retryError) {
          console.error('重试加载数据也失败:', retryError);
        }
      }
    }, 500);
  }
}

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

// 使用项目切换监听器组合式函数，整合所有初始化逻辑
useProjectChangeListener(async (newProjectId: number | string) => {
  await initDataWithRetry(newProjectId)
}, true, false)

// 初始化钩子 - 仅保留日志输出，所有初始化逻辑已整合到useProjectChangeListener中
onMounted(() => {
  console.log('SuiteList: 页面初始化完成，数据加载由useProjectChangeListener统一处理');
})

</script>


<style scoped>
.searchTool {
  display: flex;
  /* gap: 10px; */
  /* margin: 10px 0; */
  padding: 10px;
  justify-content: space-between;

}

.left-search {
  display: flex;
  gap: 10px;
}

.suit-page {
  background: #dddddd;
}

</style>