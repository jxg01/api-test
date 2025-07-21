<template>
  <div class="detail-card">
    <div class="detail-header">
      <div class="detail-title">任务详情</div>
      <div class="edit-buttons">
        <template v-if="!isEditing">
          <el-button type="primary" @click="startEditing">编辑</el-button>
        </template>
        <template v-else>
          <el-button type="success" @click="saveEdit">确认</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </template>
      </div>
    </div>
    
    <div class="detail-form">
      <div class="form-item">
        <div class="form-label">任务名称</div>
        <div v-if="!isEditing" class="form-value">{{ task.name }}</div>
        <el-input v-else v-model="editingTask.name" />
      </div>
      <div class="form-item">
        <div class="form-label">cron表达式</div>
        <div v-if="!isEditing" class="form-value">{{ task.cron }}</div>
        <el-input v-else v-model="editingTask.cron" />
      </div>
      <div class="form-item">
        <div class="form-label">状态</div>
        <div v-if="!isEditing" class="form-value">
          <el-tag :type="task.status ? 'success' : 'danger'">
            {{ task.status ? '开启' : '关闭' }}
          </el-tag>
        </div>
        <el-switch v-else v-model="editingTask.status" 
                  :active-value="1" 
                  :inactive-value="0" />
      </div>
      <div class="form-item">
        <div class="form-label">任务类型</div>
        <div v-if="!isEditing" class="form-value">{{ task.type }}</div>
        <el-select v-else v-model="editingTask.type" placeholder="请选择任务类型">
          <el-option label="数据同步" value="数据同步" />
          <el-option label="报表生成" value="报表生成" />
          <el-option label="数据清理" value="数据清理" />
          <el-option label="API调用" value="API调用" />
        </el-select>
      </div>
      <div class="form-item">
        <div class="form-label">创建人</div>
        <div class="form-value">{{ task.creator }}</div>
      </div>
      <div class="form-item">
        <div class="form-label">编辑人</div>
        <div class="form-value">{{ task.editor }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Task } from '@/stores/taskStore';
import { useTaskStore } from '@/stores/taskStore';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'update-task', task: Task): void;
}>();

const isEditing = ref(false);
const editingTask = ref<Task>({ ...props.task });

const startEditing = () => {
  isEditing.value = true;
  editingTask.value = { ...props.task };
};

const saveEdit = () => {
  isEditing.value = false;
  editingTask.value.editor = 'admin';
  emit('update-task', editingTask.value);
};

const cancelEdit = () => {
  isEditing.value = false;
};

// 当传入的task变化时，重置编辑状态
watch(() => props.task, (newTask) => {
  isEditing.value = false;
  editingTask.value = { ...newTask };
}, { deep: true });
</script>

<style scoped>
.detail-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.edit-buttons {
  display: flex;
  gap: 10px;
}

.detail-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: #606266;
}

.form-value {
  font-size: 14px;
  color: #303133;
  padding: 8px 0;
}
</style>