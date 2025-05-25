<template>
  <div class="p-4">
    <el-button type="primary" @click="openCreateForm">新建</el-button>
    <BaseTable
      :columns="tableColumns"
      :table-data="suiteStore.testSuites"
      height="calc(100vh - 319px)"
    >
      <template #testcases="scope">
        <el-tag type="primary" effect="dark"> {{ scope.row.cases.length }} </el-tag>
      </template>

      <template #operation="scope">
        <el-button link type="primary" size="small" @click.stop="openForm(scope.row)">
          编辑
        </el-button>
        <el-button link type="danger" size="small" @click.stop="suiteStore.removeSuite">
          删除
        </el-button>
      </template>
    </BaseTable>
    <TestSuiteForm
      v-if="suiteStore.formVisible"
      :visible="suiteStore.formVisible"
      :suite="suiteStore.currentSuite"
      :allCases="suiteStore.allCases"
      @close="closeForm"
      @save="suiteStore.saveSuite"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import TestSuiteForm from '@/components/suite/TestSuiteForm.vue'
import { useSuiteStore, type Suite } from '@/stores/suiteStore'
import { useRoute, useRouter } from 'vue-router'
const router = useRouter()
const route = useRoute()

// 表格配置
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'name', label: '套件名称' },
  { prop: 'project_name', label: '所属项目' },
  // { prop: 'description', label: '描述信息' },
  { prop: 'cases', label: '用例数量', width: 135, slot: 'testcases' },
  { prop: 'execution_status', label: '执行状态' },
  { prop: 'created_by', label: '创建人' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

const suiteStore = useSuiteStore()



const openForm = (suite: Suite) => {
  suiteStore.currentSuite = suite
  router.push(`/automation/suite/${suite.id}`)
}

const openCreateForm = (suite: Suite) => {
  router.push('/automation/suite/create')
}

const closeForm = () => {
  suiteStore.formVisible = false
  suiteStore.setCurrentSuite(null)
}

// 初始化数据
onMounted(() => {
  suiteStore.fetchSuites()
  suiteStore.fetchCases()
})

</script>
