<template>
  <div>
    <div class="table-header">
        <span class="table-title">最近执行记录</span>
        <el-button type="primary" size="small" @click="fetchRecentExecutions">刷新</el-button>
      </div>
      <BaseTable
        :columns="tableColumns"
        :table-data="recentExecutions"
        :loading="loading"
        height="auto"
      >
        <template #name="{ row }">
          <span>【{{ row.type==='case'?'测试用例':'测试套件' }}】  </span>
          <span>{{ row.type==='case'?row.case_name:row.name }}</span>
        </template>
        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status)" effect="dark">{{ getStatusDisplayName(row.status) }}</el-tag>
        </template>
      </BaseTable>
  </div>
</template>


<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import { dashboardApi } from '@/api'
import { useProjectStore } from '@/stores/project'

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  { prop: 'name', label: '测试内容', slot: 'name' },
  { prop: 'status', label: '状态', slot: 'status' },
  { prop: 'started_at', label: '开始时间' },
  { prop: 'duration', label: '耗时(s)' },
  { prop: 'executed_by_username', label: '执行人', width: 100 },
]

interface ExecutionRecord {
  id: string
  type: string
  name: string
  status: string
  started_at: string
  duration: string
  executed_by_username: string | null
  suite_id: string | null
  suite_name: string | null
  case_id: string | null
  case_name: string | null
}

const loading = ref(false)
const recentExecutions = ref<ExecutionRecord[]>([])
const lastFetchTime = ref(0) // 用于防止短时间内重复请求
const MIN_FETCH_INTERVAL = 1000 // 最小请求间隔(ms)

const projectStore = useProjectStore()

const fetchRecentExecutions = async () => {
  // 防止短时间内重复请求
  const now = Date.now()
  if (now - lastFetchTime.value < MIN_FETCH_INTERVAL && lastFetchTime.value > 0) {
    return
  }
  
  loading.value = true
  try {
    const params: any = { limit: 10 }
    const pid = projectStore.currentProjectId ?? projectStore.current?.id
    // 只有当有项目ID时才请求，避免无项目ID的请求
    if (pid) {
      params.project_id = pid
      lastFetchTime.value = now
      const response = await dashboardApi.getExecutionCaseAndSuiteHistory(params)
      recentExecutions.value = response?.data || []
    }
  } catch (error) {
    console.error('获取最近执行记录失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'passed': return 'success'
    case 'failed': return 'danger'
    case 'running': return 'warning'
    default: return ''
  }
}

const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'passed': return '成功'
    case 'failed': return '失败'
    case 'running': return '执行中'
    default: return status
  }
}

// 初始化时等待项目数据准备好再请求
onMounted(async () => {
  // 确保项目数据已加载
  await projectStore.ensureReady()
  // 只有当有项目ID时才请求数据
  if (projectStore.currentProjectId || projectStore.current?.id) {
    fetchRecentExecutions()
  }
})

// 项目切换时自动刷新
watch(
  () => projectStore.currentProjectId ?? projectStore.current?.id,
  (newId, oldId) => {
    // 确保ID发生了实际变化且新ID存在
    if (newId && newId !== oldId) {
      fetchRecentExecutions()
    }
  },
  { immediate: false }
)
</script>





