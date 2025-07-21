<template>
  <div class="container">
    <TaskList />
    <div class="right-panel">
      <div v-if="selectedTask" class="detail-content">
        <div class="top-row">
          <div class="top-col">
            <TaskInfo 
              :task="selectedTask" 
              @update-task="updateTask" 
            />
          </div>
          <div class="top-col">
            <TrendChart />
          </div>
        </div>
        <ExecutionHistory 
          :history="filteredHistory"
          @show-log="showLogDetail"
        />
      </div>
      
      <div v-else class="detail-card empty-state">
        <div class="empty-icon">📋</div>
        <div>请从左侧选择一个任务查看详情</div>
      </div>
      
      <LogDrawer 
        :visible="logDrawerVisible" 
        :log="selectedLog"
        @update:visible="updateLogDrawer"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTaskStore } from '@/stores/taskStore';
import TaskList from '@/components/task/TaskList.vue';
import TaskInfo from '@/components/task/TaskInfo.vue';
import TrendChart from '@/components/task/TrendChart.vue';
import ExecutionHistory from '@/components/task/ExecutionHistory.vue';
import LogDrawer from '@/components/task/LogDrawer.vue';

const taskStore = useTaskStore();
const { 
  selectedTask, 
  filteredHistory,
  logDrawerVisible,
  selectedLog
} = storeToRefs(taskStore);

const updateTask = (updatedTask: any) => {
  taskStore.updateTask(updatedTask);
};

const showLogDetail = (log: any) => {
  taskStore.showLogDetail(log);
};

const updateLogDrawer = (value: boolean) => {
  taskStore.logDrawerVisible = value;
};
</script>

<style scoped>
.container {
  display: flex;
  min-height: calc(100vh - 40px);
  gap: 20px;
  padding: 20px;
  background-color: #f5f7fa;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  float: left;
}

.detail-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.panel-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #dcdfe6;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
}

.top-col {
  flex: 1;
  min-width: 0;
}

:deep(.el-form-item__label) {
  justify-content: flex-start;
}

</style>