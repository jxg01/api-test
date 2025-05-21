<template>
    <div class="project-management-container">
      <!-- 筛选行 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-button type="primary" @click="openAddDialog" :icon="CirclePlus">添加项目</el-button>
          </el-col>
          <el-col :span="4">
            <el-input v-model="name" placeholder="请输入项目名称" clearable @keyup.enter="fetchProjectData"  :icon="Search" />
          </el-col>
          <el-button type="primary" @click="fetchProjectData" :icon="Search">搜索</el-button>
        </el-row>
      </div>
  
      <!-- 表格 -->
      <BaseTable
        :columns="tableColumns"
        :table-data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
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
        title="项目"
        @submit="handleSubmit"
      />
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue'
  import BaseDialog from '@/components/BaseDialog.vue'
  import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { projectApi } from '@/api/'
  import { CirclePlus, Search } from '@element-plus/icons-vue'
  
  type Project = {
    id: number
    name: string
    base_url: string
    description: string
    creator: string
    created_at: string
    updated_at: string
  }
  
  // 表格配置 =================================================================
  const tableColumns: TableColumn[] = [
    { prop: 'id', label: '#', width: 60 },
    { prop: 'name', label: '项目名称' },
    { prop: 'base_url', label: '项目地址' },
    { prop: 'description', label: '描述' },
    { prop: 'creator', label: '创建人' },
    { prop: 'created_at', label: '创建时间' },
    { prop: 'updated_at', label: '修改时间' },
    { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
  ]
  
  // 表单配置 =================================================================
  const formFields = [
    { 
      prop: 'name', 
      label: '项目名称',
      component: ElInput,
      attrs: { placeholder: '请输入项目名称' } 
    },
    { 
      prop: 'base_url', 
      label: '项目地址',
      component: ElInput,
      attrs: { 
        placeholder: '请输入项目地址',
        type: 'url'
      }
    },
    { 
      prop: 'description', 
      label: '描述',
      component: ElInput,
      attrs: { placeholder: '请输入项目描述' }
    }
  ]
  
  const formRules = {
    name: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 2, max: 10, message: '长度在2-10个字符', trigger: ['blur', 'change'] }
    ],
    base_url: [
      { required: true, message: '请输入项目地址', trigger: 'blur' },
      { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
    ]
  }
  
  // 数据逻辑 =================================================================
  const tableData = ref<Project[]>([])
  const loading = ref(false)
  const dialogRef = ref<InstanceType<typeof BaseDialog>>()
  const pagination = reactive({
    page: 1,
    size: 20,
    total: 0
  })
  
  const name = ref('')

    // 初始化数据
  onMounted(() => {
    fetchProjectData()
  })
  // 数据获取
  const fetchProjectData = async () => {
    try {
      loading.value = true
      const res = await projectApi.getProjectList({
        name: name.value,
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
    fetchProjectData()
  }
  
  const handleSizeChange = (size: number) => {
    pagination.size = size
    fetchProjectData()
  }
  
  // 弹窗操作
  const openAddDialog = () => dialogRef.value?.open('add', {})
  const openEditDialog = (project: Project) => dialogRef.value?.open('edit', project)
  
  // 删除操作
  const handleDelete = async (project: Project) => {
    try {
      await ElMessageBox.confirm(`确认删除项目 ${project.name} 吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      
      await projectApi.deleteProject(project.id)
      ElMessage.success('删除成功')
      fetchProjectData()
    } catch (error) {
      // ElMessage.error(error.message || '删除失败')
      console.log('error => ', error)
    }
  }
  
  // 表单提交
  const handleSubmit = async (data: Project, mode: 'add' | 'edit', done: (success?: boolean) => void) => {
    try {
      const action = mode === 'add' 
        ? projectApi.createProject(data)
        : projectApi.editProject(data.id, data)
  
      await action
      ElMessage.success(`项目${mode === 'add' ? '添加' : '编辑'}成功`)
      fetchProjectData()
      done(true)
    } catch (error) {
      // ElMessage.error(error.message || '操作失败')
      console.log('error => ', error)
      done(false)
    }
  }
  </script>
  
  <style scoped>
  .project-management-container {
    height: calc(100vh - 165px); /* 总高度减去header和footer */
    display: flex;
    flex-direction: column;
    padding: 2px;
    background: #dddddd;
    border-radius: 4px;
    overflow: hidden; /* 隐藏全局滚动条 */
  }
  
  .filter-section {
    flex-shrink: 0;
    margin: 10px 0;
  }

  </style>