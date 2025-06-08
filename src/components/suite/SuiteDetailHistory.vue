<template>
  <div>
    <!-- 底部最近执行记录 -->
    <el-card shadow="hover" class="execution-table">
      <div class="table-header">
        <span class="table-title">最近执行记录【10条】</span>
        <el-button type="primary" size="small" @click="handleRefresh">刷新</el-button>
      </div>
      <BaseTable
        :columns="tableColumns"
        :table-data="executionHistory"
        height="auto"
        :loading="loading"
      >
        <template #StatusTag="scope">
          <el-tag :type="getStatusType(scope.row.status)" effect="dark"> {{ getStatusDisplay(scope.row.status) }} </el-tag>
        </template>

        <template #PassRate="scope">
          <span>{{ scope.row.pass_rate }}%</span>
        </template>
        <template #operation="scope">
          <el-button link type="primary" @click="viewDetail(scope.row)">详情</el-button>
        </template>
      </BaseTable>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import type { SuiteHistory } from '@/types/suite';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import { useSuiteStore } from '@/stores/suiteStore';

const store = useSuiteStore();

const props = defineProps<{
  suiteId: number;
}>();

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  { prop: 'id', label: '#', width: 60 },
  { prop: 'suite', label: '套件名称' },
  { prop: 'status', label: '状态', width: 120, slot: 'StatusTag' },
  { prop: 'pass_rate', label: '通过率', width: 120, slot: 'PassRate' },
  { prop: 'started_at', label: '开始时间' },
  { prop: 'ended_at', label: '结束时间' },
  { prop: 'duration', label: '耗时(S)', width: 120 },
  { prop: 'executed_by', label: '执行人', width: 120 },
  { prop: 'operation', label: '操作', width: 120, slot: 'operation' }
]

const executionHistory = ref<SuiteHistory[]>([])
const loading = ref(false)

const handleRefresh = async () => {
  loading.value = true;
  try {
    // 调用 API 获取执行记录
    const res = await store.fetchSuiteDetailExecutionHistory(props.suiteId);
    if (res) {
      executionHistory.value = res.data;
    } else {
      executionHistory.value = [];
    }
    loading.value = false;
  } catch (error) {
    console.error('加载执行记录失败:', error);
    loading.value = false;
  }
}

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'passed':
      return '成功'
    case 'failed':
      return '失败'
    case 'running':
      return '执行中'
    default:
      return '异常状态'
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'passed':
      return 'success'
    case 'failed':
      return 'danger'
    case 'running':
      return 'warning'
    default:
      return 'info'
  }
}

const viewDetail = (row: SuiteHistory) => {
  console.log('查看执行详情:', row);
}

onMounted(() => {
  handleRefresh();
});

</script>
