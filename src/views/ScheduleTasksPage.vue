<template>
  <div class="schedule-tasks-container">
    <!-- 顶部操作栏 -->
    <el-card shadow="never" class="toolbar-card" style="text-align: left;">
      <el-button type="primary" :icon="Plus" @click="openAddDialog"> 新建任务 </el-button>
    </el-card>

    <!-- 表格卡片 -->
    <el-card shadow="never" class="mt-4">
      <!-- 表格 -->
      <BaseTable
        :columns="tableColumns"
        :table-data="tableDataList"
        :loading="loading"
        height="calc(100vh - 300px)"
      >
        <template #status="scope">
          <el-tag
            :type="scope.row.enabled ? 'success' : 'danger'"
            effect="dark"
          >
            {{ scope.row.enabled ? '启用' : '禁用' }}
          </el-tag>
        </template>
        <template #operation="scope">
          <el-button 
            link
            type="primary"
            :icon="Edit" 
            @click="openEditDialog(scope.row)"
          />
          <el-button 
            link
            :icon="Delete" 
            type="danger" 
            @click="confirmDelete(scope.row)"
          />
        </template>
      </BaseTable>

      <BasePagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑任务' : '新建任务'"
      width="500px"
      @close="dialogVisible = false">
    
      <el-form
        ref="dialogFormRef"
        :model="currentTasks"
        :rules="formRules"
        label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="currentTasks.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型" prop="task_type">
          <el-select v-model="currentTasks.task_type" placeholder="请选择任务类型">
            <el-option
              v-for="(page, index) in taskTypes"
              :key="index"
              :label="page.label"
              :value="page.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Cron表达式" prop="cron">
          <el-input v-model="currentTasks.cron" placeholder="请输入Cron表达式: * */2 * * *" />
        </el-form-item>
        <el-form-item label="任务状态" prop="enabled">
          <el-switch v-model="currentTasks.enabled" active-text="启用" inactive-text="禁用" inline-prompt />
        </el-form-item>
        <!-- <el-form-item> -->
          
        <!-- </el-form-item> -->
      
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>



<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue'
  import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
  import { Plus, Edit, Delete } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import BasePagination from '@/components/BasePagination.vue'
  import { scheduleTasksApi } from '@/api'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const isEditing = ref(false)
  const dialogFormRef = ref()

  const tableColumns = ref<TableColumn[]>([
    { prop: 'name', label: '任务名称' },
    { prop: 'task_type', label: '任务类型' },
    { prop: 'cron', label: '时间表达式' },
    { prop: 'enabled', label: '状态', slot: 'status'  },
    { prop: 'created_by', label: '创建人' },
    { prop: 'created_at', label: '创建时间' },
    { prop: 'updated_by', label: '更新人' },
    { prop: 'updated_at', label: '更新时间' },
    { prop: 'operation', label: '操作', width: '100px', slot: 'operation' }
  ])

  type tasksTypes = {
    id: number
    name: string
    task_type: string
    cron: string
    enabled: boolean
    created_at?: string
    updated_at?: string
    created_by?: string
    updated_by?: string
  }

  const currentTasks = ref<tasksTypes>(
    {
      id: 0,
      name: '',
      task_type: '',
      cron: '',
      enabled: false,
    }
  )

  const taskTypes = [
    { label: 'API', value: 'api' },
    { label: 'UI', value: 'ui' },
  ]

  const formRules = reactive({
    name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    task_type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
    cron: [{ required: true, message: '请输入时间表达式', trigger: 'blur' }],
  })

  const tableDataList = ref<tasksTypes[]>([])

  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  })

  const openAddDialog = () => {
    isEditing.value = false
    dialogVisible.value = true
    currentTasks.value = {
      id: 0,
      name: '',
      task_type: '',
      cron: '',
      enabled: false,
    }
  }

  const openEditDialog = (row: any) => {
    isEditing.value = true
    dialogVisible.value = true
    currentTasks.value = { ...row }
  }

  const confirmDelete = async (row: any) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除任务 "${row.name}" 吗？`,
        '提示',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await scheduleTasksApi.deleteScheduleTask(row.id)
      ElMessage.success('任务已删除')
      fetchTasksList() // 刷新任务列表
    } catch (error) {
      // 用户取消或接口异常都进入这里
      if (error !== 'cancel') {
        ElMessage.error('删除任务失败')
      }
      console.log('取消删除操作或发生异常', error)
    }
  }

      // 分页处理
  const handlePageChange = (page: number) => {
    pagination.currentPage = page
    fetchTasksList()
  }

  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    fetchTasksList()
  }

  const fetchTasksList = async () => {
    loading.value = true
    try {
      // 模拟获取数据
      const res = await scheduleTasksApi.getScheduleTasksList({
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      })
      pagination.total = res.meta.pagination.total
      pagination.currentPage = res.meta.pagination.page
      pagination.pageSize = res.meta.pagination.per_page
      tableDataList.value = res.data as tasksTypes[]
      // 这里可以将数据赋值给表格
    } catch (error) {
      ElMessage.error('获取任务列表失败')
    } finally {
      loading.value = false
    }
  }

  const submitForm = async () => {
    try {
      await dialogFormRef.value?.validate()
      if (isEditing.value) {
        // 更新任务
        const { id, ...updateData } = currentTasks.value
        const res = await scheduleTasksApi.editScheduleTask(id, updateData)
        if (res) {
          ElMessage.success('任务更新成功')
        }
      } else {
        // 新建任务
        const res = await scheduleTasksApi.createScheduleTask(currentTasks.value)
        if (res) {
          ElMessage.success('任务创建成功')
        }
      }
      dialogVisible.value = false
      fetchTasksList()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  onMounted(() => {
    fetchTasksList()
  })


</script>


