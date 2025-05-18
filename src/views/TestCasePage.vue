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
      <div class="searchTool" v-show="store.activeTab === 'list'">
        <el-button type="primary">搜索</el-button>
        <el-input></el-input>
      </div>
      
      <BaseTable
        :columns="tableColumns"
        :table-data="store.paginatedCases"
        :loading="store.loading"
      >
        <template #operation="scope">
          <el-button type="primary" size="small" @click.stop="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click.stop="handleDelete(scope.row.id)">
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
        @submit="handleSubmit(tab)"
        @cancel="store.setActiveTab('list')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCaseStore, TestCase } from '@/stores/testcase'
import CaseTabs from '@/components/testcase/CaseTabs.vue'
import CaseForm from '@/components/testcase/CaseForm.vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue'
import { ref, onMounted } from 'vue'

const store = useCaseStore()

// 表格配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'name', label: '用例名称' },
  { prop: 'interface_name', label: '接口名称' },
  { prop: 'updated_by', label: '更新人' },
  { prop: 'updated_at', label: '更新时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

// 初始化数据
onMounted(() => {
  store.fetchCaseList()
})

const handleAddNew = () => {
  store.addNewCase()
}

const handleEdit = (row: TestCase) => {
  store.editCase(row)
}

const handleDelete = async (id: string) => {
  try {
    await store.deleteCase(id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleSubmit = async (tab: EditTab) => {
  try {
    await store.saveCase(tab)
    ElMessage.success('保存成功')
    store.setActiveTab('list')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.table-container {
  padding-top: 5px;
}
.searchTool {
  display: flex;
  margin: 10px 0;
}
</style>