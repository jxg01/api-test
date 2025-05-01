<template>
  <div class="user-management-container">
    <!-- 搜索区域 -->
    <el-row class="filter-row" :gutter="20">
      <el-col :span="4">
        <el-button type="primary" @click="openAddDialog">添加用户</el-button>
      </el-col>
      <el-col :span="4">
        <el-input
          v-model="filterParams.username"
          placeholder="请输入用户名"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-col>
        <el-col :span="4">
        <el-input
          v-model="filterParams.email"
          placeholder="请输入邮箱"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-col>
      <el-button type="primary" @click="fetchUserData">搜索</el-button>
    </el-row>

    <!-- 表格 -->
    <BaseTable
      :columns="tableColumns"
      :table-data="tableData"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <template #status="scope">
        <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
          {{ scope.row.is_active ? '激活' : '禁用' }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" size="small" @click="openEditDialog(scope.row)">
          编辑
        </el-button>
        <el-button type="danger" size="small" @click="handleDelete(scope.row)">
          删除
        </el-button>
      </template>
    </BaseTable>

    <!-- 表单弹窗 -->
    <BaseDialog
      ref="dialogRef"
      :fields="formFields"
      :rules="formRules"
      title="用户"
      @submit="handleSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/'

type User = {
  id: number
  username: string
  email: string
  is_active: boolean
  date_joined: string
  last_login: string
}

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'username', label: '用户名' },
  { prop: 'email', label: '邮箱' },
  { prop: 'date_joined', label: '注册时间' },
  { prop: 'update_time', label: '编辑时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

// 表单配置 =================================================================
const formFields = [
  { 
    prop: 'username', 
    label: '用户名',
    component: 'ElInput',
    attrs: { placeholder: '请输入用户名' } 
  },
  { 
    prop: 'email', 
    label: '邮箱',
    component: 'ElInput',
    attrs: { 
      type: 'email',
      placeholder: '请输入邮箱地址'
    }
  },
  { 
    prop: 'password', 
    label: '密码',
    component: 'ElInput',
    attrs: { 
      type: 'password',
      placeholder: '请输入密码',
    }
  },
  { 
    prop: 'password_confirm', 
    label: '确认密码',
    component: 'ElInput',
    attrs: { 
      type: 'password',
      placeholder: '请再次输入密码',
    }
  }
]

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 16, message: '长度在4-16个字符', trigger: ['blur', 'change'] }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6-20个字符', trigger: ['blur', 'change'] }
  ]
}

// 数据逻辑 =================================================================
const tableData = ref<User[]>([])
const loading = ref(false)
const dialogRef = ref<InstanceType<typeof BaseDialog>>()
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const filterParams = reactive({
  username: '',
  email: ''
})

// 生命周期
onMounted(() => {
  fetchUserData()
})
// 数据获取
const fetchUserData = async () => {
  try {
    loading.value = true
    const res = await userApi.getUserList({
      username: filterParams.username,
      email: filterParams.email,
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
  fetchUserData()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchUserData()
}

// 弹窗操作
const openAddDialog = () => dialogRef.value?.open('add', {})
const openEditDialog = (user: User) => dialogRef.value?.open('edit', user)

// 删除操作
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${user.username} 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await userApi.deleteUser(user.id)
    ElMessage.success('删除成功')
    fetchUserData()
  } catch (error) {
    ElMessage.error(error.message || '删除失败')
  }
}

// 表单提交
const handleSubmit = async (data: any, mode: 'add' | 'edit', done: (success?: boolean) => void) => {
  try {
    const action = mode === 'add' 
      ? userApi.createUser(data)
      : userApi.updateUser(data.id, data)

    await action
    ElMessage.success(`用户${mode === 'add' ? '添加' : '编辑'}成功`)
    fetchUserData()
    done(true)
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
    done(false)
  }
}
</script>

<style scoped>
.user-management-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.filter-row {
  margin-bottom: 20px;

  .el-col {
    display: flex;
    align-items: center;
  }
  .el-input {
    width: 100%;
    width: 150px;
  }
}
</style>
