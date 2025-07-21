<template>
  <el-row class="schedule-tasks-layout" style="height: 100%;">
    <!-- 左侧：定时任务列表 -->
    <el-col :style="{ width: '320px', minWidth: '220px', maxWidth: '400px', borderRight: '1px solid #eee', height: '100%' }">
      <ScheduleTaskList
        :tasks="tableDataList"
        :loading="loading"
        @edit="openEditDialog"
        @delete="confirmDelete"
        @select="handleSelectTask"
        @add="openAddDialog"
      />
    </el-col>
    <!-- 右侧：任务执行结果 -->
    <el-col :style="{ flex: 1, height: '100%' }">
      <ScheduleTaskResult :task="selectedTask" />
    </el-col>
  </el-row>

  <!-- 新建/编辑弹窗 -->
  <ScheduleTaskDialog
    v-model:visible="dialogVisible"
    :is-editing="isEditing"
    :task="currentTasks"
    :task-types="taskTypes"
    :form-rules="formRules"
    @submit="submitForm"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import ScheduleTaskList from '@/components/ScheduleTasks/ScheduleTaskList.vue'
import ScheduleTaskResult from '@/components/ScheduleTasks/ScheduleTaskResult.vue'
// import ScheduleTaskDialog from '@/components/ScheduleTasks/ScheduleTaskDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { scheduleTasksApi } from '@/api'

const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const currentTasks = ref<any>({})
const selectedTask = ref<any>(null)
const tableDataList = ref<any[]>([])
const taskTypes = [
  { label: 'API', value: 'api' },
  { label: 'UI', value: 'ui' },
]
const formRules = reactive({
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  task_type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  cron: [{ required: true, message: '请输入时间表达式', trigger: 'blur' }],
})

const fetchTasksList = async () => {
  loading.value = true
  try {
    const res = await scheduleTasksApi.getScheduleTasksList({
        page:1,
        pageSize: 20
      })
    tableDataList.value = res.data
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEditing.value = false
  dialogVisible.value = true
  currentTasks.value = { name: '', task_type: '', cron: '', enabled: false }
}
const openEditDialog = (task: any) => {
  isEditing.value = true
  dialogVisible.value = true
  currentTasks.value = { ...task }
}
const confirmDelete = async (task: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除任务 "${task.name}" 吗？`, '提示', { type: 'warning' })
    await scheduleTasksApi.deleteScheduleTask(task.id)
    ElMessage.success('任务已删除')
    fetchTasksList()
    if (selectedTask.value?.id === task.id) selectedTask.value = null
  } catch (e) {}
}
const handleSelectTask = (task: any) => {
  selectedTask.value = task
}
const submitForm = async (task: any) => {
  // 你的表单提交逻辑
  dialogVisible.value = false
  fetchTasksList()
}

onMounted(fetchTasksList)
</script>

<style scoped>
.schedule-tasks-layout {
  height: 100%;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  color: #222;
  background: #fafbfc;
  font-size: 15px;
}


</style>
