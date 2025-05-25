<!-- src/views/suite/SuiteExecutions.vue -->
<template>
  <div class="execution-history">
    <el-timeline>
      <el-timeline-item
        v-for="log in executionLogs"
        :key="log.id"
        :type="log.status === 'success' ? 'success' : 'danger'"
        :timestamp="formatTime(log.startTime)"
      >
        <el-card>
          <div class="log-header">
            <span>状态: {{ log.status }}</span>
            <span>耗时: {{ calcDuration(log) }}</span>
            <el-button size="small" @click="viewDetail(log)">查看详情</el-button>
            <el-button size="small" @click="downloadLog(log)">下载日志</el-button>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchExecutionLogs } from '@/api/suite'

interface ExecutionLog {
  id: string
  suiteId: string
  status: 'success' | 'failed'
  startTime: string
  endTime: string
  logPath: string
}

const route = useRoute()
const executionLogs = ref<ExecutionLog[]>([])
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

const formatTime = (time: string) => new Date(time).toLocaleString()
const calcDuration = (log: ExecutionLog) => {
  const start = new Date(log.startTime)
  const end = new Date(log.endTime)
  return `${(end.getTime() - start.getTime()) / 1000}s`
}

const loadLogs = async () => {
  try {
    const res = await fetchExecutionLogs(route.params.id as string, {
      page: pagination.value.current,
      size: pagination.value.size
    })
    executionLogs.value = res.data
    pagination.value.total = res.total
  } catch (error) {
    console.error(error)
  }
}

const viewDetail = (log: ExecutionLog) => { /* 跳转到详情页 */ }
const downloadLog = (log: ExecutionLog) => { /* 下载日志逻辑 */ }

onMounted(loadLogs)
</script>