<template>
  <div class="detail-card">
    <div class="panel-header">执行历史</div>
    <el-table :data="history" class="history-table">
      <el-table-column prop="time" label="执行时间" width="180" />
      <el-table-column prop="result" label="执行结果" width="120">
        <template #default="{ row }">
          <el-tag :type="getResultTagType(row.result)">
            {{ row.result }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="耗时(秒)" width="100" />
      <el-table-column prop="trigger" label="触发方式" />
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button type="text" @click="showLogDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { ExecutionLog } from '@/stores/taskStore';

const props = defineProps<{
  history: ExecutionLog[];
}>();

const emit = defineEmits<{
  (e: 'show-log', log: ExecutionLog): void;
}>();

const getResultTagType = (result: string) => {
  switch (result) {
    case '成功': return 'success';
    case '失败': return 'danger';
    case '退出': return 'warning';
    default: return 'info';
  }
};

const showLogDetail = (log: ExecutionLog) => {
  emit('show-log', log);
};
</script>

<style scoped>
.history-table {
  width: 100%;
  margin-top: 15px;
}
</style>