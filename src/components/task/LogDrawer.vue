<template>
  <el-drawer 
    v-model="visible" 
    title="执行日志详情" 
    size="50%"
    @close="handleClose"
  >
    <div class="log-drawer">
      <div class="log-header">
        <h3>{{ log?.taskName }} 执行日志</h3>
        <div>执行时间: {{ log?.time }}</div>
        <div>执行结果: 
          <el-tag :type="getResultTagType(log?.result || '')" size="small">
            {{ log?.result }}
          </el-tag>
        </div>
      </div>
      <div class="log-content">{{ log?.logContent }}</div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ExecutionLog } from '@/stores/taskStore';

const props = defineProps<{
  visible: boolean;
  log: ExecutionLog | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const visible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  }
});

const getResultTagType = (result: string) => {
  switch (result) {
    case '成功': return 'success';
    case '失败': return 'danger';
    case '退出': return 'warning';
    default: return 'info';
  }
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.log-drawer {
  padding: 20px;
}

.log-header {
  margin-bottom: 20px;
}

.log-header h3 {
  margin-bottom: 10px;
}

.log-content {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  max-height: 70vh;
  overflow: auto;
}
</style>