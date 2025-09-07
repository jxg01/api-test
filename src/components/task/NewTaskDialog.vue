<template>
  <div>
    <el-dialog 
      v-model="dialogVisible" 
      title="新增任务" 
      width="500px"
      @close="handleDialogClose"
      
    >
      <el-form :model="currentTasks" :rules="rules" ref="formRef" label-width="120px" label-position="top">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="currentTasks.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型" prop="task_type">
          <el-select v-model="currentTasks.task_type" placeholder="请选择任务类型">
            <el-option label="ui" value="ui" />
            <el-option label="api" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间表达式" prop="cron">
          <el-input v-model="currentTasks.cron" placeholder="请输入时间表达式(示例: 5 2 * * *)" />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch v-model="currentTasks.enabled" :active-value="true" :inactive-value="false"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import type { Task } from '@/stores/tasksStore';
import type { FormInstance, FormRules } from 'element-plus';
import { en } from 'element-plus/es/locale';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'add-task', task: Task): void;
  (e: 'update:visible', value: boolean): void;  // 添加这个事件
}>();

const dialogVisible = computed({
  get() {
    return props.visible;  // 从父组件获取值
  },
  set(value) {
    emit('update:visible', value);  // 更新父组件的值
  }
});

const defualtTask = {
  name: '',
  cron: '',
  enabled: true,
  task_type: 'ui'
};
const currentTasks = ref<any>({ ...defualtTask });

const formRef = ref<FormInstance>()
const rules: FormRules = {
  name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  cron: [
    { required: true, message: 'cron表达式不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 简单cron格式校验
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
  // enabled: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('submitForm', currentTasks.value);
      emit('add-task', currentTasks.value);
      // dialogVisible.value = false;
      currentTasks.value = { ...defualtTask }; // 重置表单
    } else {
      console.log('error submit!!');
      return
    }
  });
};

const handleDialogClose = () => {
  formRef.value?.clearValidate(); // 清除所有校验提示
  dialogVisible.value = false;
  currentTasks.value = { ...defualtTask };
  console.log('Dialog closed, reset currentTasks:', currentTasks.value);
};



</script>


<style scoped>


</style>

