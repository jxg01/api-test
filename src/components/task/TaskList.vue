<template>
  <div class="left-panel">
    <div style="display: flex; justify-content: space-between;">
      <div class="panel-header">任务列表</div>
      <el-button type="primary" @click.stop="openAddDialog">新增</el-button>
    </div>
    <el-table 
      :data="tasks" 
      highlight-current-row
      @row-click="handleRowClick"
      :row-class-name="rowClassName"
      show-overflow-tooltip
      height="calc(100vh - 220px)"
    >
      <el-table-column prop="name" label="任务名称" width="180">
        <template #default="{ row }">
          <div class="task-name-cell">
            <span :style="{
              'font-weight': 'bold',
              'color': row.task_type === 'api' ? '#FFA500' : row.task_type === 'ui' ? '#DA70D6' : 'inherit'
            }">{{ row.task_type === 'api' ? 'API' : 'UI' }}</span>
            {{ row.name }}
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="type" label="任务类型" width="120" /> -->
      <el-table-column label="状态">
        <template #default="{ row }">
          <div class="status-cell">
            <el-tag :type="row.enabled ? 'success' : 'danger'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button link type="danger" size="small" @click="deleteTask(row)" :icon="Delete"></el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>

  <ScheduleTaskDialog 
    :visible="dialogVisible" 
    @add-task="addTask" 
    @update:visible="dialogVisible = $event"
  />

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTaskStore } from '@/stores/tasksStore';
import { storeToRefs } from 'pinia';
import type { Task } from '@/stores/tasksStore';
import ScheduleTaskDialog from '@/components/task/NewTaskDialog.vue';
import { Delete } from '@element-plus/icons-vue';

const taskStore = useTaskStore();
const { tasks } = storeToRefs(taskStore);

const emit = defineEmits<{
  (e: 'delete-task', task: Task): void;
}>();

const dialogVisible = ref(false)
// const currentTasks = ref<any>({})

const openAddDialog = () => {
  dialogVisible.value = true
  console.log('openAddDialog', dialogVisible.value);
}

const handleRowClick = (task: any) => {
  taskStore.selectTask(task.id);
};

const rowClassName = ({ row }: { row: any }) => {
  return row.id === taskStore.selectedTaskId ? 'selected-row' : '';
};

const deleteTask = (task: Task) => {
  emit('delete-task', task);
};

const addTask = (task: Task) => {
  taskStore.addTask(task);
  dialogVisible.value = false;
  // currentTasks.value = {};
};

</script>

<style scoped>
.left-panel {
  width: 350px;
  min-width: 350px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 15px;
  overflow: auto;
}

.panel-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.selected-row) {
  background-color: #ecf5ff !important;
}
</style>
