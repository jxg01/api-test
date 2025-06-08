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
        <template #status="{ row }">
          <el-tag >{{ row.status }}</el-tag>
        </template>
      </BaseTable>
  </div>
</template>


<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import { dashboardApi } from '@/api'

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  // { prop: 'id', label: 'ID', width: 60 },
  { prop: 'type', label: '类型', width: 100 },
  // { prop: 'suite_name', label: '套件名称' },
  // { prop: 'case_name', label: '用例名称' },
  { prop: 'name', label: '名称' },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'started_at', label: '开始时间', width: 180 },
  { prop: 'duration', label: '耗时(s)', width: 100 },
  { prop: 'executed_by_username', label: '执行人', width: 100 },
  
  // { prop: 'operation', label: '操作', width: 120, slot: 'operation' }
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

const fetchRecentExecutions = async () => {
  loading.value = true
  try {
    const response = await dashboardApi.getExecutionCaseAndSuiteHistory({
      limit: 10,
    })
    recentExecutions.value = response.data || []
  } catch (error) {
    console.error('获取最近执行记录失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecentExecutions()
})

</script>





