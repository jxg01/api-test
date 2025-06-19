<template>
  <div class="global-variable-management-container">
    <div class="filter-tool">
      <div class="search-tool">
        <el-input
            v-model="filterParams.name"
            placeholder="请输入变量名称"
            clearable
            @keyup.enter="fetchVariableData"
            style="max-width: 200px;"
          >
          <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
        </el-input>
        <el-button type="primary" @click.stop="fetchVariableData" :icon="Search">搜索</el-button>
      </div>
      <div>
        <el-button type="primary" @click="openAddDialog" :icon="Plus">添加变量</el-button>
      </div>
    </div>
    <!-- 表格 -->
    <BaseTable
      :columns="tableColumns"
      :table-data="tableData"
      :loading="loading"
      height="calc(100vh - 215px)"
    >
      <template #operation="scope">
        <el-button link type="primary" size="small" @click="openEditDialog(scope.row)">
          编辑
        </el-button>
        <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
          删除
        </el-button>
      </template>
    </BaseTable>

    <!-- 表单弹窗 -->
    <BaseDialog
      ref="dialogRef"
      :fields="formFields"
      :rules="formRules"
      title="全局变量"
      @submit="handleSubmit"
    />

    <BasePagination
      :current-page="pagination.page"
      :page-size="pagination.size"
      :total="pagination.total"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { variableApi } from '@/api/'
import { Search, Plus } from '@element-plus/icons-vue'

type GlobalVariable = {
  id: number
  name: string
  value: string
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
}

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  { prop: 'id', label: '编号', width: 60 },
  { prop: 'name', label: '变量名' },
  { prop: 'value', label: '变量值' },
  { prop: 'created_by', label: '创建人' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'updated_by', label: '修改人' },
  { prop: 'updated_at', label: '修改时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

// 表单配置 =================================================================
const formFields = [
  { 
    prop: 'name', 
    label: '变量名称',
    component: ElInput,
    attrs: { placeholder: '请输入变量名称' } 
  },
  { 
    prop: 'value', 
    label: '变量值',
    component: ElInput,
    attrs: { 
      placeholder: '请输入变量值',
      // type: 'textarea',
      // rows: 3
    }
  }
]

const formRules = {
  name: [
    { required: true, message: '请输入变量名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在2-50个字符', trigger: ['blur', 'change'] }
  ],
  value: [
    { required: true, message: '请输入变量值', trigger: 'blur' }
  ]
}

// 数据逻辑 =================================================================
const tableData = ref<GlobalVariable[]>([])
const loading = ref(false)
const dialogRef = ref<InstanceType<typeof BaseDialog>>()
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const filterParams = reactive({
  name: '',
})

// 生命周期
onMounted(() => {
  fetchVariableData()
})

// 数据获取
const fetchVariableData = async () => {
  try {
    loading.value = true
    const res = await variableApi.getVariableList({
      ...filterParams,
      page: pagination.page,
      size: pagination.size
    })
    
    tableData.value = res.data
    pagination.total = res.meta.pagination.total
    pagination.page = res.meta.pagination.page
  } finally {
    loading.value = false
  }
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchVariableData()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchVariableData()
}

// 弹窗操作
const openAddDialog = () => dialogRef.value?.open('add', {})
const openEditDialog = (variable: GlobalVariable) => dialogRef.value?.open('edit', variable)

// 删除操作
const handleDelete = async (variable: GlobalVariable) => {
  try {
    await ElMessageBox.confirm(`确认删除变量 ${variable.name} 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await variableApi.deleteVariable(variable.id)
    ElMessage.success('删除成功')
    fetchVariableData()
  } catch (error) {
    // ElMessage.error(error.message || '删除失败')
    console.log('error => ', error)
  }
}

// 表单提交
const handleSubmit = async (data: GlobalVariable, mode: 'add' | 'edit', done: (success?: boolean) => void) => {
  try {
    const action = mode === 'add' 
      ? variableApi.createVariable(data)
      : variableApi.updateVariable(data.id, data)

    await action
    ElMessage.success(`变量${mode === 'add' ? '添加' : '编辑'}成功`)
    fetchVariableData()
    done(true)
  } catch (error) {
    // ElMessage.error(error.message || '操作失败')
    console.log('error => ', error)
    done(false)
  }
}
</script>

<style scoped>
.global-variable-management-container {
  background: #dddddd;
  border-radius: 4px;
}

.filter-tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* margin-bottom: 14px; */
  padding: 10px;
  /* gap: 10px; */
}

.search-tool {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 300px;
  min-width: 160px;
}


</style>
