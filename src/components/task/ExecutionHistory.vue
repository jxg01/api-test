<template>
  <div class="detail-card">
    <div class="panel-header">执行历史</div>
    <!-- 执行历史表格 -->
    <BaseTable
      :columns="tableColumns"
      :table-data="history"
      :loading="store.loading"
      height="470px"
    >
      <template #statusTag="scope">
        <el-tag :type="getResultTagType(scope.row.status)" effect="dark">
          {{ getResultDisplay(scope.row.status) }}
        </el-tag>
      </template>
      <template #triggerDisplay="scope">
        <span>{{ scope.row.trigger === 'auto' ? '自动触发' : '手动触发' }}</span>
      </template>
      <template #operation="scope">
        <el-button link type="primary" size="small" @click.stop="showLogDetail(scope.row)">
          详情
        </el-button>
      </template>
    </BaseTable>

    <BasePagination
      v-model:current-page="store.currentPage"
      v-model:page-size="store.pageSize"
      :total="store.total"
      :page-sizes="[5, 10, 20, 50]"
      @page-change="store.setCurrentPage"
      @size-change="store.setPageSize"
    />
  </div>
</template>

<script setup lang="ts">
import type { ExecutionLog } from '@/stores/tasksStore';
import { useTaskStore } from '@/stores/tasksStore';
import { onMounted } from 'vue';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue'
import { ElMessage } from 'element-plus';

const store = useTaskStore();

const props = defineProps<{
  history: ExecutionLog[];
}>();

// 表格配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'status', label: '执行结果', slot: 'statusTag' },
  { prop: 'trigger', label: '触发方式', slot: 'triggerDisplay' },
  { prop: 'duration', label: '耗时(秒)'},
  { prop: 'created_at', label: '创建时间' },
  { prop: 'executor', label: '创建人' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
];

const emit = defineEmits<{
  (e: 'show-log', log: ExecutionLog): void;
}>();

const getResultTagType = (result: string) => {
  switch (result) {
    case 'completed': return 'success';
    case 'error': return 'danger';
    case 'running': return 'warning';
    default: return 'info';
  }
};

const getResultDisplay = (result: string) => {
  switch (result) {
    case 'completed': return '已完成';
    case 'error': return '失败';
    case 'running': return '运行中';
    default: return result;
  }
};

const showLogDetail = (log: ExecutionLog) => {
  if (log.status === 'running') {
    ElMessage.warning('该任务正在执行中，暂无详情可查看');
    return;
  }
  emit('show-log', log);
};

onMounted(() => {
  store.fetchExecutionHistory();
});


</script>

<style scoped>
.history-table {
  width: 100%;
  margin-top: 15px;
}
.panel-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}
</style>
