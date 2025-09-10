<template>
  <div class="execution-history-page">
    <div class="searchTool">
      <el-select v-model="filterParams.type" placeholder="选择类型" clearable>
        <el-option label="测试用例" value="case" />
        <el-option label="测试套件" value="suite" />
      </el-select>
      <el-select v-model="filterParams.status" clearable placeholder="选择状态">
        <el-option label="成功" value="passed" />
        <el-option label="失败" value="failed" />
        <el-option label="执行中" value="running" />
      </el-select>
      <el-date-picker
          v-model="filterParams.start_date"
          type="date"
          placeholder="请选择开始日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      <el-date-picker
          v-model="filterParams.end_date"
          type="date"
          placeholder="请选择结束日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD" 
        />
      <el-button type="primary" @click.stop="handleSearch()" :icon="Search"> 搜索</el-button>
      <el-button type="primary" @click.stop="cancelSearchInput" :icon="RefreshLeft" plain> 重置</el-button>
    </div>

    <BaseTable
      :columns="tableColumns"
      :table-data="executionHistory"
      :loading="loading"
      height="calc(100vh - 215px)"
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
import { onMounted, ref, watch } from 'vue';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue';
import { suiteApi } from '@/api';
import { Search, RefreshLeft } from '@element-plus/icons-vue';
import type { SuiteHistory } from '@/types/suite';
import { dashboardApi } from '@/api'
import ViewCaseHistory from '@/components/ExecutionHistory/ViewCaseHistory.vue';
import ViewSuiteHistory from '@/components/ExecutionHistory/ViewSuiteHistory.vue';
import { useProjectStore } from '@/stores/project';
import { useProjectChangeListener } from '@/composables/useProjectChangeListener';

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  // { prop: 'id', label: '#', width: 60 },
  { prop: 'suite', label: '名称', slot: 'name' },
  { prop: 'status', label: '状态', width: 120, slot: 'StatusTag' },
  // { prop: 'pass_rate', label: '通过率', width: 120, slot: 'PassRate' },
  { prop: 'started_at', label: '执行时间' },
  // { prop: 'ended_at', label: '结束时间' },
  { prop: 'executed_by_username', label: '执行人' },
  { prop: 'duration', label: '耗时(S)', width: 120 },
  { prop: 'operation', label: '操作', width: 120, slot: 'operation' }
]

const projectStore = useProjectStore();
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const filterParams = ref({
  end_date: '',
  start_date: '',
  status: '',
  type: ''
})
const executionHistory = ref<SuiteHistory[]>([])
const loading = ref(false)

// 搜索条件变化时，用户手动点击搜索按钮触发页码重置
// 移除了自动监听重置，避免过度重置影响用户体验

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
const fetchList = async(projectId?: number | string) => {
  if (filterParams.value.start_date && filterParams.value.end_date) {
    if (new Date(filterParams.value.start_date) > new Date(filterParams.value.end_date)) {
      filterParams.value.end_date = filterParams.value.start_date
    }
  } else if (filterParams.value.start_date && !filterParams.value.end_date) {
    filterParams.value.end_date = filterParams.value.start_date
  } else if (!filterParams.value.start_date && filterParams.value.end_date) {
    filterParams.value.start_date = filterParams.value.end_date
  }
  loading.value = true
  try {
    const response = await dashboardApi.getExecutionCaseAndSuiteHistory({
      ...filterParams.value,
      project_id: projectId || projectStore.currentProjectId,
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
    end_date: '',
    start_date: '',
    status: '',
    type: ''
  }
  fetchList()
}

// 搜索处理函数，搜索时重置页面为1
const handleSearch = () => {
  currentPage.value = 1
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

// 整合初始化数据逻辑，包括重试机制
async function initDataWithRetry(projectId: number | string) {
  // 重置分页
  currentPage.value = 1;
  try {
    await fetchList(projectId);
  } catch (error) {
    console.error('首次加载数据失败，将重试:', error);
    // 首次加载失败，尝试重试一次
    setTimeout(async () => {
      if (projectStore.currentProjectId) {
        try {
          await fetchList(projectId);
        } catch (retryError) {
          console.error('重试加载数据也失败:', retryError);
        }
      }
    }, 500);
  }
}

// 使用项目切换监听器组合式函数，整合所有初始化逻辑
useProjectChangeListener(async (newProjectId: number | string) => {
  await initDataWithRetry(newProjectId);
}, true, false);

// 初始化钩子 - 仅保留日志输出，所有初始化逻辑已整合到useProjectChangeListener中
onMounted(() => {
  // console.log('ExecutionHistoryPage: 页面初始化完成，数据加载由useProjectChangeListener统一处理');
})

</script>


<style scoped>
.searchTool {
  display: flex;
  align-items: center;
  /* margin-bottom: 12px; */
  padding: 10px;
  max-width: 900px;
  min-width: 200px;
  gap: 10px;
}

.execution-history-page {
  background: #dddddd;
}

</style>
