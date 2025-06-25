<template>
  <div class="element-repository-container">
    <!-- 顶部操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="search-tools">
        <div class="left-search">
          <el-input v-model="store.filterParams.name" placeholder="搜索元素名称/页面" clearable />
          
          <el-select v-model="store.filterParams.locator_type" placeholder="定位方式" clearable>
            <el-option
              v-for="type in locatorTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
          <el-button type='primary' @click="store.fetchUiElementList()">搜索</el-button>
        </div>
        
        <div>
          <el-button type="primary" :icon="Plus" @click="openAddDialog"> 新建元素 </el-button>
        </div>
      </div>
    </el-card>

    <!-- 元素表格 -->
    <el-card shadow="never" class="mt-4">
      <!-- 表格 -->
      <BaseTable
        :columns="tableColumns"
        :table-data="store.uiElementList"
        :loading="loading"
        height="calc(100vh - 300px)"
      >
        <template #locatorTypeTag="scope">
          <!-- <span>{{ getLocatorLabel(scope.row.locator_type) }}</span> -->
          <el-tag :type="getLocatorTagType(scope.row.locator_type)" effect="dark"> {{ getLocatorLabel(scope.row.locator_type) }} </el-tag>
          <!-- <el-tag :type="getLocatorTagType(scope.row.locator_type)">
            {{ scope }}
            {{ scope.row }}
            {{ scope.row.locator_type }}
          </el-tag> -->
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
            @click="confirmDelete(scope.row.id)"
          />
        </template>
      </BaseTable>

      <BasePagination
        v-model:current-page="store.currentPage"
        v-model:page-size="store.pageSize"
        :total="store.total"
        @page-change="store.handlePageChange"
        @size-change="store.handleSizeChange"
      />
    </el-card>

    <!-- <BaseDialog
      ref="dialogRef"
      :fields="formFields"
      :rules="formRules"
      title="页面元素"
      @submit="handleSubmit"
    /> -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑元素' : '新建元素'"
      width="500px"
      @close="dialogVisible = false">
    
      <el-form
        ref="elementForm"
        :model="currentElement"
        :rules="formRules"
        label-width="100px">
        <el-form-item label="元素名称" prop="name">
          <el-input v-model="currentElement.name" placeholder="请输入元素名称" />
        </el-form-item>
        <el-form-item label="所属页面" prop="page">
          <el-select v-model="currentElement.page" placeholder="选择或输入页面路径" filterable allow-create>
            <el-option
              v-for="(page, index) in pageOptions"
              :key="index"
              :label="page.label"
              :value="page.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="定位方式" prop="locator_type">
          <el-select v-model="currentElement.locator_type" placeholder="请选择定位方式" clearable>
            <el-option
              v-for="type in locatorTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="定位值" prop="locator_value">
          <el-input v-model="currentElement.locator_value" placeholder="CSS选择器/XPath表达式" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="currentElement.description"
            type="textarea"
            :rows=3
            placeholder="请输入元素描述"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitElementForm">提交</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, shallowRef } from 'vue'
import { Search, Plus, Edit, Delete, View, Check } from '@element-plus/icons-vue'
import type { FormRules, FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue'
import { useProjectStore } from '@/stores/project'
import { useUiTestStore, PageElement } from '@/stores/uiTestStore'

const projectStore = useProjectStore()
const store = useUiTestStore()

onMounted(async() => {
  // 确保 current 项目存在（支持刷新场景）
  if (!projectStore.currentProjectId) {
    await projectStore.initCurrentProject()
  }

  if (projectStore.currentProjectId) {
    const projectId = projectStore.currentProjectId
    // 1. 先加载页面数据
    await store.fetchUiPage(projectId)
    console.log('页面数据加载完成:', store.uiPageList)
    
    // 2. 再加载元素数据
    await store.fetchUiElementList(projectId)
    console.log('元素数据加载完成')
  }
})



// 定位类型选项
const locatorTypes = [
  { value: 'css', label: 'CSS' },
  { value: 'xpath', label: 'XPATH' },
  { value: 'text', label: 'TEXT' },
  { value: 'id', label: 'ID' },
  { value: 'class', label: 'CLASS' },
  { value: 'name', label: 'NAME' }
]

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  { prop: 'id', label: '#', width: 60 },
  { prop: 'name', label: '元素名称' },
  { prop: 'locator_type', label: '定位方式', slot: 'locatorTypeTag' },
  { prop: 'locator_value', label: '定位值' },
  { prop: 'page', label: '所属页面' },
  { prop: 'description', label: '描述' },
  { prop: 'created_at', label: '创建时间' },
  { prop: 'updated_at', label: '修改时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

// 表单验证规则
const formRules: FormRules = {
  name: [{ required: true, message: '请输入元素名称', trigger: 'blur' }],
  page: [{ required: true, message: '请输入所属页面', trigger: 'blur' }],
  locator_type: [{ required: true, message: '请选择定位方式', trigger: 'change' }],
  locator_value: [{ required: true, message: '请输入定位值', trigger: 'blur' }],
  description: [{ required: false, message: '请输入描述', trigger: 'blur' }]
}

// 数据逻辑 =================================================================
const loading = ref(false)



const getLocatorLabel = (type: string) => {
  const found = locatorTypes.find(t => t.value === type)
  return found ? found.label : type
}

// 弹窗内容
const elementForm = ref<FormInstance>()
const dialogVisible = ref(false)
const isEditing = ref(false)
const currentElement = ref<PageElement>({
  id: 0,
  name: '',
  locator_type: 'css',
  locator_value: '',
  description: '',
  page: '',
})
const pageOptions = computed(() => {
  return store.uiPageList.map(page => ({
    label: page,
    value: page
  }))
})

const openAddDialog = () => {
  currentElement.value = {
    id: 0,
    name: '',
    locator_type: 'css',
    locator_value: '',
    description: '',
    page: '',
  }
  isEditing.value = false
  dialogVisible.value = true
}

const openEditDialog = (element: PageElement) => {
  currentElement.value = { ...element }
  isEditing.value = true
  dialogVisible.value = true
}

const submitElementForm = async () => {
  await elementForm.value?.validate()
  try {
    if (isEditing.value) {
      // 更新元素
      const res = await store.updateUiElement({...currentElement.value, project: projectStore.currentProjectId})
      if (res) {
        ElMessage.success('元素更新成功')
        dialogVisible.value = false
      }
      
    } else {
      // 新增元素
      const res = await store.addUiElement({...currentElement.value, project: projectStore.currentProjectId})
      if (res) {
        ElMessage.success('元素创建成功')
        dialogVisible.value = false
      }
    }
    await store.fetchUiElementList()
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } 
}

const confirmDelete = async (id: number) => {
  await ElMessageBox.confirm('确定删除此元素吗？此操作不可撤销', '警告', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await store.deleteUiElement(id)
  store.fetchUiElementList()
  ElMessage.success('元素已删除')
  
}















const getLocatorTagType = (type: string) => {
  const types: Record<string, string> = {
    css: 'success',
    xpath: 'warning',
    text: 'info',
    id: 'danger',
    class: 'primary',
  }
  return types[type] || 'primary' 
}



</script>

<style scoped>
.element-repository-container {
  /* padding: 20px; */
  background-color: #f5f7fa;
  /* min-height: calc(100vh - 60px); */
}

.toolbar-card {
  border-radius: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background-color: #ff5f56; }
.dot.yellow { background-color: #ffbd2e; }
.dot.green { background-color: #27c93f; }

.mock-browser-url {
  flex: 1;
  background: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  border: 1px solid #dcdfe6;
}

.mock-content {
  padding: 20px;
  min-height: 200px;
  background-color: #fff;
  position: relative;
}

.element-highlight {
  position: relative;
  padding: 20px;
  border: 2px dashed #409eff;
  border-radius: 4px;
  background-color: rgba(64, 158, 255, 0.1);
}

.highlight-box {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.element-label {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  font-weight: bold;
}

.info-label {
  display: inline-block;
  width: 80px;
  font-weight: bold;
  color: #606266;
}

.search-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left-search {
  display: flex;
  gap: 10px;
  min-width: 400px;
}
</style>
