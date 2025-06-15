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
        <template #expand="props">
          <el-card class="env-list" >
          <el-table 
            :data="props.row.envs" 
            border
            show-overflow-tooltip
          >
          <!-- <el-table :data="envsList" class="env-list" border> -->
            <el-table-column label="环境名称" prop="name" />
            <el-table-column label="环境地址" prop="url" />
            <el-table-column label="备注信息" prop="description" />
            <el-table-column label="更新人" prop="updated_at" />
            <el-table-column label="更新时间" prop="updated_by" />
            <!-- <el-table-column label="创建人" prop="created_at" />
            <el-table-column label="创建时间" prop="created_by" /> -->
            <el-table-column fixed="right" label="操作" min-width="60">
              <template #default="scopes">
                <el-button link type="primary" size="small" @click.stop="openEditDialogEnvs(scopes.row)">
                  编辑
                </el-button>
                <el-button link type="danger" size="small" @click.stop="handleDeleteEnv(scopes.row)">删除</el-button>
              </template>
            </el-table-column>
            
          </el-table>
        </el-card>
        </template>
        <template #projectName="scope">
          <div class="project-name-displayname">
            <svg width="14" height="14" viewBox="0 0 24 24" v-if="projectStore.currentProjectId === scope.row.id">
              <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" fill="#00FF00"/>
            </svg>
            <span>{{ scope.row.name }}</span>
          </div>
          
        </template>

        <template #operation="scope">
          <el-button link type="primary" size="small" @click="openAddDialogEnvs(scope.row)">
            新增环境
          </el-button>
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
        title="项目"
        @submit="handleSubmit"
      />

      <!-- env表单 -->
      <BaseDialog
        ref="dialogRefEnvs"
        :fields="envFormFields"
        :rules="envFormRules"
        title="环境"
        @submit="handleSubmitEnvs"
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
  import { useProjectStore } from '@/stores/project'

  const projectStore = useProjectStore()
  
  type Project = {
    id: number
    name: string
    base_url: string
    description: string
    creator: string
    created_at: string
    updated_at: string
    envs?: any[]
    loading?: boolean  // 添加加载状态
    expanded?: boolean // 添加展开状态
  }
  
  // 表格配置 =================================================================
  const tableColumns: TableColumn[] = [
    { prop: 'expand', label: '环境', width: 60, type: 'expand', slot: 'expand' },
    { prop: 'id', label: 'ID', width: 60 },
    // { prop: 'name', label: '项目名称' },
    { prop: 'name', label: '项目名称', slot: 'projectName' },
    // { prop: 'base_url', label: '项目地址' },
    { prop: 'description', label: '描述' },
    { prop: 'created_by', label: '创建人' },
    { prop: 'created_at', label: '创建时间' },
    { prop: 'updated_at', label: '修改时间' },
    { prop: 'operation', label: '操作', width: 220, slot: 'operation' }
  ]
  
  // 表单配置 - projcet =================================================================
  const formFields = [
    { 
      prop: 'name', 
      label: '项目名称',
      component: ElInput,
      attrs: { placeholder: '请输入项目名称' } 
    },
    { 
      prop: 'description', 
      label: '描述',
      component: ElInput,
      attrs: { placeholder: '请输入项目描述' }
    }
  ]
  // 表单配置 - env =================================================================
  const envFormFields = [
    { 
      prop: 'name', 
      label: '环境名称',
      component: ElInput,
      attrs: { placeholder: '请输入环境名称' } 
    },
    { 
      prop: 'url', 
      label: '环境地址',
      component: ElInput,
      attrs: { placeholder: '请输入环境地址' } 
    },
    { 
      prop: 'description', 
      label: '描述',
      component: ElInput,
      attrs: { placeholder: '请输入环境描述' }
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

  const envFormRules = {
    name: [
      { required: true, message: '请输入环境名称', trigger: 'blur' },
    ],
    url: [
      { required: true, message: '请输入环境地址', trigger: 'blur' },
      { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
    ]
  }
  
  // 数据逻辑 =================================================================
  const tableData = ref<Project[]>([])
  const loading = ref(false)
  const dialogRef = ref<InstanceType<typeof BaseDialog>>()
  const dialogRefEnvs = ref<InstanceType<typeof BaseDialog>>()
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
  
  // 弹窗操作
  const openAddDialogEnvs = (row: any) => dialogRefEnvs.value?.open('add', {'project': row.id})
  const openEditDialogEnvs = (envs: []) => dialogRefEnvs.value?.open('edit', envs)
  


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

    // 表单提交
    const handleSubmitEnvs = async (data: any, mode: 'add' | 'edit', done: (success?: boolean) => void) => {
    try {
      const action = mode === 'add' 
        ? projectApi.createProjectEnv(data)
        : projectApi.editProjectEnv(data.id, data)
  
      await action
      ElMessage.success(`环境${mode === 'add' ? '添加' : '编辑'}成功`)
      fetchProjectData()
      done(true)
    } catch (error) {
      // ElMessage.error(error.message || '操作失败')
      console.log('error => ', error)
      done(false)
    }
  }

    // 删除操作
  const handleDeleteEnv = async (env: any) => {
    try {
      console.log(env)
      await ElMessageBox.confirm(`确认删除项目 ${env.name} 吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      
      await projectApi.delteProjectEnv(env.id)
      ElMessage.success('删除成功')
      fetchProjectData()
    } catch (error) {
      // ElMessage.error(error.message || '删除失败')
      console.log('error => ', error)
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
  
  .env-list {
    margin: 10px 60px;
    width: 80%;
  }

  .project-name-displayname {
    display: flex;
    align-items: center;
  }

  </style>