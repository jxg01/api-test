<template>
  <div class="detail-card">
    <div class="detail-header">
      <div class="detail-title">任务详情</div>
      <div class="edit-buttons">
        <template v-if="!isEditing">
          <el-button type="danger" @click="runTaskManually">手动执行</el-button>
          <el-button type="primary" @click="startEditing">编辑</el-button>
        </template>
        <template v-else>
          <el-button type="success" @click="saveEdit">确认</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </template>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="editingTask"
      :rules="rules"
      label-width="80px"
      label-position="top"
      class="detail-form"
    >
      <el-row :gutter="24">
        <!-- 任务名称 -->
        <el-col :span="spans">
          <el-form-item label="任务名称" prop="name">
             <el-input v-model="editingTask.name" :disabled="!isEditing" />
          </el-form-item>
        </el-col>
        <!-- cron表达式 -->
        <el-col :span="spans">
          <el-form-item label="cron表达式" prop="cron">
            <el-input v-model="editingTask.cron" :disabled="!isEditing" />
          </el-form-item>
        </el-col>
        <!-- 状态 -->
        <el-col :span="spans">
          <el-form-item label="状态" prop="enabled">
            <el-switch v-model="editingTask.enabled" :active-value="true" :inactive-value="false" :disabled="!isEditing" />
          </el-form-item>
        </el-col>
        <!-- 任务类型 -->
        <el-col :span="spans">
          <el-form-item label="任务类型" prop="task_type">
            <el-select  v-model="editingTask.task_type" placeholder="请选择任务类型" :disabled="!isEditing">
              <el-option label="ui" value="ui" />
              <el-option label="api" value="api" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 创建人 -->
        <el-col :span="spans">
          <el-form-item label="创建人">
            <div class="form-value">{{ task.created_by }}</div>
          </el-form-item>
        </el-col>
        <!-- 编辑人 -->
        <el-col :span="spans">
          <el-form-item label="编辑人">
            <div class="form-value">{{ task.updated_by }}</div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus'
import type { Task } from '@/stores/tasksStore';
import { useTaskStore } from '@/stores/tasksStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { scheduleTasksApi } from '@/api/scheduleTasks.api';
import { on } from 'ace-builds-internal/config';

const spans = 11

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'update-task', task: Task): void;
}>();

const formRef = ref<FormInstance>()
const rules: FormRules = {
  name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  cron: [
    { required: true, message: 'cron表达式不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 简单cron格式校验（可根据实际需求调整正则）
        // const cronRegex = /^(\*|([0-9]|[1-5][0-9]))(\s+(\*|([0-9]|[1-5][0-9]))){4,5}$/
        const cronRegex = /^(\*|([0-9]|[1-5][0-9])|([0-9]-[0-9])|(\*\/[0-9]+))(\s+(\*|([0-9]|[1-5][0-9])|([0-9]-[0-9])|(\*\/[0-9]+))){4}$/;

        
        if (!cronRegex.test(value)) {
          callback(new Error('请输入有效的cron表达式'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  task_type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  enabled: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const isEditing = ref(false);
const editingTask = ref<Task>({ ...props.task });

const startEditing = () => {
  isEditing.value = true;
  editingTask.value = { ...props.task };
};

const saveEdit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      isEditing.value = false;
      // editingTask.value.editor = 'admin';
      emit('update-task', editingTask.value);
    }
  });
};

// 手动执行任务
const runTaskManually = async () => {
  try {
    // 添加确认弹窗
    await ElMessageBox.confirm(
      `确定要手动执行任务 "${props.task.name}" 吗？`,
      '确认执行',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await scheduleTasksApi.runTaskManually(props.task.id);
    ElMessage.success('API测试任务已手动触发，正在执行中');
  } catch (error) {
    // 如果用户取消，不显示错误消息
    if (error !== 'cancel') {
      ElMessage.error('任务执行失败');
      console.error('手动执行任务失败:', error);
    }
  }
};

// 在cancelEdit方法中清除校验提示
const cancelEdit = () => {
  isEditing.value = false;
  editingTask.value = { ...props.task }; // 恢复为原始数据
  formRef.value?.clearValidate(); // 清除所有校验提示
};

// 当传入的task变化时，重置编辑状态
watch(() => props.task, (newTask) => {
  isEditing.value = false;
  editingTask.value = { ...newTask };
  formRef.value?.clearValidate(); // 清除所有校验提示
}, { deep: true });
</script>

<style scoped>
.detail-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  /* height: 100%; */
  height: 300px;
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

/* 可选：让两列间距更美观 */
.detail-form .el-row {
  row-gap: 0;
  column-gap: 24px;
}

/* .detail-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
} */

/* .form-label {
  font-size: 14px;
  color: #606266;
} */

.form-value {
  font-size: 14px;
  color: #303133;
  padding: 8px 0;
}
</style>