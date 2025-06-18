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
          <!-- <span v-if="row.suite_id">{{ row.suite_name }}</span>
          <span v-else>{{ row.case_name }}</span> -->
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
import { ref, onMounted } from 'vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import { dashboardApi } from '@/api'

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  // { prop: 'id', label: 'ID', width: 60 },
  // { prop: 'type', label: '类型', width: 100 },
  // { prop: 'suite_name', label: '套件名称' },
  // { prop: 'case_name', label: '用例名称' },
  { prop: 'name', label: '测试内容', slot: 'name' },
  { prop: 'status', label: '状态', slot: 'status' },
  { prop: 'started_at', label: '开始时间' },
  { prop: 'duration', label: '耗时(s)' },
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

// 获取状态标签类型, 不同标签显示不同颜色
const getStatusType = (status: string) => {
  switch (status) {
    case 'passed':
      return 'success'
    case 'failed':
      return 'danger'
    case 'running':
      return 'warning'
  }
}

const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'passed':
      return '成功'
    case 'failed':
      return '失败'
    case 'running':
      return '执行中'
  }
}


onMounted(() => {
  fetchRecentExecutions()
})

</script>





