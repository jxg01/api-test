<template>
  <div class="left-panel">
    <div style="display: flex; justify-content: space-between;">
      <div class="panel-header">任务列表</div>
      <el-button type="primary">新增</el-button>
    </div>
    <el-table 
      :data="tasks" 
      highlight-current-row
      @row-click="handleRowClick"
      :row-class-name="rowClassName"
    >
      <el-table-column prop="name" label="任务名称" width="180" />
      <!-- <el-table-column prop="type" label="任务类型" width="120" /> -->
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <div class="status-cell">
            <el-switch 
              v-model="row.status" 
              @click.stop
              @change="updateTaskStatus(row)"
              :active-value="1" 
              :inactive-value="0"
            />
            <span>{{ row.status ? '开启' : '关闭' }}</span>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="creator" label="创建人" /> -->
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore';
import { storeToRefs } from 'pinia';

const taskStore = useTaskStore();
const { tasks } = storeToRefs(taskStore);

const handleRowClick = (task: any) => {
  taskStore.selectTask(task.id);
};

const rowClassName = ({ row }: { row: any }) => {
  return row.id === taskStore.selectedTaskId ? 'selected-row' : '';
};

const updateTaskStatus = (task: any) => {
  taskStore.updateTaskStatus(task);
};
</script>

<style scoped>
.left-panel {
  width: 320px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 15px;
  overflow: hidden;
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
