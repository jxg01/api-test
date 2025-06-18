<template>
  <div class="execution-history-page">
    <div class="searchTool">
      <el-input v-model="filterParams.name" clearable placeholder="请输入套件名称"/>
      <el-input v-model="filterParams.executed_by" clearable placeholder="请输入执行人" />
      <el-button type="primary" @click.stop="fetchList" :icon="Search"> 搜索</el-button>
    </div>
      
    <BaseTable
      :columns="tableColumns"
      :table-data="executionHistory"
      :loading="loading"
      height="calc(100vh - 295px)"
    >
      <template #name="{ row }">
        <span>【{{ row.type==='case'?'测试用例':'测试套件' }}】  </span>
        <span>{{ row.type==='case'?row.case_name:row.name }}</span>
      </template>
      <template #StatusTag="scope">
        <el-tag :type="getStatusType(scope.row.status)" effect="dark"> {{ getStatusDisplay(scope.row.status) }} </el-tag>
      </template>

      <template #PassRate="scope">
        <span>{{ scope.row.pass_rate }}%</span>
      </template>

      <template #operation="scope">
        <el-button link type="primary" size="small" @click.stop="viewHistoryDetail(scope.row)">
          详情
        </el-button>
      </template>
    </BaseTable>

    <BasePagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[5, 10, 20, 50]"
      @page-change="setCurrentPage"
      @size-change="setPageSize"
    />

    <ViewCaseHistory ref="caseDrawer" />
    <ViewSuiteHistory ref="suiteDrawer" />
  </div>
</template>


<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue';
import { suiteApi } from '@/api';
import { Search } from '@element-plus/icons-vue';
import type { SuiteHistory } from '@/types/suite';
import { dashboardApi } from '@/api'
import ViewCaseHistory from '@/components/ExecutionHistory/ViewCaseHistory.vue';
import ViewSuiteHistory from '@/components/ExecutionHistory/ViewSuiteHistory.vue';

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  // { prop: 'id', label: '#', width: 60 },
  { prop: 'suite', label: '套件名称', slot: 'name' },
  { prop: 'status', label: '状态', width: 120, slot: 'StatusTag' },
  // { prop: 'pass_rate', label: '通过率', width: 120, slot: 'PassRate' },
  { prop: 'started_at', label: '执行时间' },
  // { prop: 'ended_at', label: '结束时间' },
  { prop: 'executed_by_username', label: '执行人' },
  { prop: 'duration', label: '耗时(S)', width: 120 },
  { prop: 'operation', label: '操作', width: 120, slot: 'operation' }
]

const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const filterParams = ref({
  name: '',
  executed_by: '',
})
const executionHistory = ref<SuiteHistory[]>([])
const loading = ref(false)

const setCurrentPage = (page: number) => {
  currentPage.value = page
  fetchList()
}

const setPageSize = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

// 获取列表
const fetchList = async() => {
  loading.value = true
  try {
    const response = await dashboardApi.getExecutionCaseAndSuiteHistory({
      ...filterParams.value,
      page: currentPage.value,
      size: pageSize.value
    })
    if (response) {
      executionHistory.value = response.data
      total.value = response.meta.pagination.total
      pageSize.value = response.meta.pagination.per_page
      currentPage.value = response.meta.pagination.page
    } else {
      executionHistory.value = []
      total.value = 0
    }
    loading.value = false
  } catch (error) {
    console.error('获取数据失败:', error)
    loading.value = false
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

const caseDrawer = ref();
const suiteDrawer = ref();

const viewHistoryDetail = (row: SuiteHistory) => {

  if (row.type === 'case') {
    caseDrawer.value.openDrawer(row);
  } else {
    suiteDrawer.value.openDrawer(row);
  }
}

onMounted(() => {
  fetchList()
})

</script>


<style scoped>
.searchTool {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  max-width: 500px;
  min-width: 100px;
  gap: 10px;
  margin: 20px 0;
}

</style>
