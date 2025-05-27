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
        height="calc(100vh - 319px)"
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

const store = useCaseStore()

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

// 初始化数据
onMounted(() => {
  store.fetchCaseList()
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

</script>

<style scoped>
.case-management {
  /* height: calc(100vh - 160px); */
  /* overflow: hidden; */
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
