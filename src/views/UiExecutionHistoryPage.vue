<template>
  <div class="execution-history-page">
    <div class="searchTool">
      <el-select v-model="filterParams.case_status" clearable placeholder="选择状态">
        <el-option label="成功" value="passed" />
        <el-option label="失败" value="failed" />
        <el-option label="执行中" value="running" />
      </el-select>
      <el-input v-model="filterParams.case_name" placeholder="搜索用例名称" clearable ></el-input>
      <el-input v-model="filterParams.executed_by" placeholder="搜索执行人" clearable ></el-input>
      <el-button type="primary" @click.stop="fetchList" :icon="Search"> 搜索</el-button>
      <el-button type="primary" @click.stop="cancelSearchInput" :icon="RefreshLeft" plain> 重置</el-button>
    </div>

    <BaseTable
      :columns="tableColumns"
      :table-data="executionHistory"
      :loading="loading"
      height="calc(100vh - 215px)"
    >
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

    <CaseExecutionDetail ref="uiCaseDrawer" />
  </div>
</template>


<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue';
import { uiTestApi   } from '@/api';
import { Search, RefreshLeft } from '@element-plus/icons-vue';
import type { SuiteHistory } from '@/types/suite';
import { dashboardApi } from '@/api'
import CaseExecutionDetail from '@/components/UiTest/CaseExecutionDetail.vue';

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  { prop: 'testcase_name', label: '用例名称' },
  { prop: 'status', label: '状态', width: 120, slot: 'StatusTag' },
  { prop: 'executed_at', label: '执行时间' },
  { prop: 'executed_by', label: '执行人' },
  { prop: 'duration', label: '耗时(S)', width: 120 },
  { prop: 'operation', label: '操作', width: 120, slot: 'operation' }
]

const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const filterParams = ref({
  status: '',
  case_name: '',
  case_status: '',
  executed_by: ''
})

type UiHistory = {
  testcase_name: string
  status: string
  executed_at: Date
  executed_by: string
  duration: number
}

const executionHistory = ref<UiHistory[]>([])
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
  // if (filterParams.value.start_date && filterParams.value.end_date) {
  //   if (new Date(filterParams.value.start_date) > new Date(filterParams.value.end_date)) {
  //     filterParams.value.end_date = filterParams.value.start_date
  //   }
  // } else if (filterParams.value.start_date && !filterParams.value.end_date) {
  //   filterParams.value.end_date = filterParams.value.start_date
  // } else if (!filterParams.value.start_date && filterParams.value.end_date) {
  //   filterParams.value.start_date = filterParams.value.end_date
  // }
  loading.value = true
  try {
    const response = await uiTestApi.getExecutionHistory({
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

const cancelSearchInput = () => {
  filterParams.value = {
    status: '',
    case_name: '',
    case_status: '',
    executed_by: ''
  }
  fetchList()
}

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'passed':
      return '成功'
    case 'failed':
      return '失败'
    case 'running':
      return '执行中'
    case 'error':
      return '异常'
    default:
      return '未定义状态'
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
    case 'error':
      return 'warning'
    default:
      return 'info'
  }
}

const uiCaseDrawer = ref();

const viewHistoryDetail = (row: SuiteHistory) => {
  console.log(row)
  if (row.status === 'failed' || row.status === 'passed' || row.status === 'error') {
    uiCaseDrawer.value.openDrawer(row); // 打开弹窗
  } else {
    ElMessage.warning('任务正在执行中！ '); // 提示用户
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
  /* margin-bottom: 12px; */
  padding: 10px;
  max-width: 600px;
  min-width: 200px;
  gap: 10px;
}

.execution-history-page {
  background: #dddddd;
}

</style>
