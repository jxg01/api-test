<template>
  <div class="case-management">
    <CaseTabs
      :activeTab="store.activeTab"
      :tabs="store.tabs"
      @tab-remove="store.removeEditTab"
      @close-all="store.closeAllTabs"
    />

    <!-- 列表视图 -->
    <div v-show="store.activeTab === 'list'">
      <CaseSearch></CaseSearch>
      
      <BaseTable
        :columns="tableColumns"
        :table-data="store.cases"
        :loading="store.loading"
        height="calc(100vh - 270px)"
      >
        <template #StatusTag="scope">
          <el-tag :type="scope.row.enabled?'primary': 'danger'" effect="dark"> {{ scope.row.enabled ? '启用': '禁用' }} </el-tag>
        </template>

        <template #operation="scope">
          <el-button link type="primary" size="small" @click.stop="store.editCase(scope.row)">
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click.stop="handleDelete(scope.row)">
            删除
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

    <!-- 表单视图 -->
    <div v-for="tab in store.editTabs" :key="tab.name">
      <CaseForm
        v-if="store.activeTab === tab.name"
        :form-data="tab.formData"
        :tabInfo="tab"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCaseStore, TestCase } from '@/stores/testcase'
import CaseTabs from '@/components/testcase/CaseTabs.vue'
import CaseForm from '@/components/testcase/CaseForm.vue'
import CaseSearch from '@/components/testcase/CaseSearch.vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue'
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { variableApi } from '@/api'
import { useProjectStore } from '@/stores/project'
import { useProjectChangeListener } from '@/composables/useProjectChangeListener'

const store = useCaseStore()
const projectStore = useProjectStore()

// 刷新测试用例数据
async function refreshTestCaseData(projectId: number | string) {
  try {
    store.editTabs = []
    store.activeTab = 'list'
    await store.fetchCaseList(Number(projectId))
    // 刷新Python函数名称列表
    await fetchPythonNameList()
  } catch (error) {
    console.error('刷新测试用例数据失败:', error)
  }
}

// 表格配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'name', label: '用例名称' },
  { prop: 'interface_name', label: '接口名称' },
  { prop: 'enabled', label: '状态', width: 135, slot: 'StatusTag' },
  { prop: 'updated_by', label: '更新人' },
  { prop: 'updated_at', label: '更新时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

// 整合初始化数据逻辑，包括重试机制
async function initDataWithRetry(projectId: number | string) {
  try {
    await refreshTestCaseData(projectId);
  } catch (error) {
    console.error('首次加载数据失败，将重试:', error);
    // 首次加载失败，尝试重试一次
    setTimeout(async () => {
      if (projectStore.currentProjectId) {
        try {
          await refreshTestCaseData(projectId);
        } catch (retryError) {
          console.error('重试加载数据也失败:', retryError);
        }
      }
    }, 500);
  }
}

// 使用项目切换监听器组合式函数，整合所有初始化逻辑
useProjectChangeListener(async (newProjectId: number | string) => {
  await initDataWithRetry(newProjectId)
}, true, false)

// 初始化钩子 - 仅保留日志输出，所有初始化逻辑已整合到useProjectChangeListener中
onMounted(() => {
  console.log('TestCasePage: 页面初始化完成，数据加载由useProjectChangeListener统一处理');
})

const handleDelete = async (row: any) => {
  try{
    await ElMessageBox.confirm(`确认删除用例 ${row.name} 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await store.deleteCase(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('error => ', error)
  }
}

const fetchPythonNameList = async () => {
  try {
    const response = await variableApi.getPythonFunctionNameList()
    store.pythonFunctionList = response.data || []
  } catch (error) {
    console.error('获取 Python 名称列表失败:', error)
  }
}

</script>

<style scoped>
.case-management {
  background: #dddddd;
}
.table-container {
  padding-top: 5px;
}
.searchTool {
  display: flex;
  margin: 10px 0;
  padding-left: 10px;
  gap: 12px;
}
</style>
