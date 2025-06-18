<!-- src/views/suite/SuiteEditor.vue -->
<template>
  <div class="suite-editor">
    <!-- 头部操作栏 -->
    <div class="editor-header">
      <el-page-header @back="handleCancel">
        <template #title>
          <span class="header-title">返回列表</span>
        </template>
        <template #content>
          <span class="editor-title">{{ formData.name || '新建套件' }}</span>
        </template>
      </el-page-header>
      
      
      <div class="action-buttons">
        <el-select
        v-model="store.projectEnvsSelect"
        placeholder="选择环境"
        class="run-env"
        >
          <el-option
            v-for="env in projectStore.current?.envs"
            :key="env.id"
            :label="env.name"
            :value="env.id"
          />
        </el-select>
        <el-button type="primary" @click="runCurrentSuite" :disabled="store.projectEnvsSelect?false:true">运行</el-button>
        <template v-if="!isEditing">
          <el-button type="primary" @click="enterEditMode">编辑</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="cancelEdit" v-if="formData.id">取消</el-button>
        </template>
      </div>
    </div>

    <!-- 表单主体 -->
     <el-card>
    <div class="form-container">
      <el-form 
        :model="formData" 
        label-width="120px" 
        ref="formRef"
        :rules="rules"
      >
        <el-row :gutter="30">
          <el-col :span="10">
            <div class="base-title">
              <!-- <label>基础信息</label> -->
              <span class="editor-title"><el-icon><HomeFilled /></el-icon> 基础信息</span>
            </div>

            <el-form-item label="套件名称" prop="name">
              <span style="color: black;" v-if="!isEditing">{{ formData.name }}</span>
              <el-input v-else v-model="formData.name" />
              <!-- <el-input v-model="formData.name" :disabled="!isEditing" /> -->
            </el-form-item>

            <el-form-item label="套件描述" prop="description">
              <span style="color: black;" v-if="!isEditing">{{ formData.description }}</span>
              <el-input v-else v-model="formData.description" />
              <!-- <el-input type="textarea" v-model="formData.description" :disabled="!isEditing" /> -->
            </el-form-item>

            <el-form-item label="最近记录" v-if="formData.execution_status">
              <el-tag  type="danger" effect="dark">{{ formData.execution_status }}</el-tag>
            </el-form-item>
          </el-col>

          <el-col :span="14">
            <div class="base-title">
              <!-- <label>基础信息</label> -->
              <span class="editor-title"><el-icon><HomeFilled /></el-icon> 关联的用例</span>
              <el-tooltip content="添加关联用例" placement="top">
                <el-button link @click.stop="addRelatedCases" :disabled="!isEditing">➕</el-button>
              </el-tooltip>
            </div>
            <el-card class="status-card" shadow="hover">
              <div class="table-container">
              <BaseTable
              :columns="tableColumns"
              :table-data="relatedCasesList"
              height="auto"
              >
              <template #operation="scope" class="related-case-table">
                <div class="operation-buttons">
                  
                  <el-button link @click="moveUp(scope.$index)" :disabled="!isEditing"><el-icon><CaretTop /></el-icon></el-button>
                  <el-button link @click="moveDown(scope.$index)" :disabled="!isEditing"><el-icon><CaretBottom /></el-icon></el-button>
                  <!-- removeRelatedCase -->
                  <el-button 
                    link type="primary" 
                    size="small" 
                    @click.stop="getCaseDetail(scope.row.id)">
                    详情
                  </el-button>
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click.stop="removeRelatedCase(scope.row)"
                    class="action-buttons"
                    :disabled="!isEditing"
                    >
                  移除
                  </el-button>
                </div>
              </template>
            </BaseTable>
          </div>
            </el-card>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <SuiteDetailHistory v-if="formData.id" :suite-id="Number(formData.id)" />
  </el-card>

    <el-dialog v-model="dialogFormVisible" title="关联用例" width="30%" @close="handleCloseRelatedCaseDialog">
      <el-form>
        <el-form-item label="用例">
          <el-select
            v-model="relatedCaseIdSelect"
            placeholder="选择用例"
            filterable
            >
            <el-option
              v-for="cx in store.casesRelatedProject"
              :key="cx.id"
              :label="cx.name"
              :value="cx.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseRelatedCaseDialog">取消</el-button>
        <el-button 
          type="primary" 
          @click="addToTable"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <ViewRelatedTestCase ref="caseDrawer"/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { suiteApi } from '@/api'
import { useSuiteStore, Suite, TestCase } from '@/stores/suiteStore'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import SuiteDetailHistory from './SuiteDetailHistory.vue'
import { useProjectStore } from '@/stores/project'
import ViewRelatedTestCase from './ViewRelatedTestCase.vue'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()

const store = useSuiteStore()
const projectStore = useProjectStore()



// 表单数据
const formData = ref<Suite>({
  id: '',
  name: '',
  description: '',
  execution_status: '',
  cases: [],
  project: store.localProjectId
})

// 校验规则定义
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '套件名称不能为空', trigger: 'blur' },
    // { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '套件描述不能为空', trigger: 'blur' },
  ],
})

// 页面只读配置 ================================================================
// 添加编辑状态相关逻辑
const isEditing = ref(false)
const originalData = ref<Suite | null>(null)

// 进入编辑模式
const enterEditMode = () => {
  isEditing.value = true
  // 保存原始数据副本
  originalData.value = JSON.parse(JSON.stringify(formData.value))
}
// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  if (originalData.value) {
    // 恢复原始数据
    formData.value = JSON.parse(JSON.stringify(originalData.value))
  }
}
// 页面只读配置 ================================================================
// 关联用例列表 配置 ================================================================
const tableColumns: TableColumn[] = [
  // { prop: 'id', label: 'ID', width: 60 },
  { prop: 'name', label: '用例名称' },
  { prop: 'operation', label: '操作', width: 230, slot: 'operation' }
]

// 关联用例列表 ================================================================
const relatedCasesList = computed(() => {
  // 根据 formData.value.cases 的顺序过滤和排序
  return formData.value.cases
    .map(id => store.casesRelatedProject.find((c: TestCase) => c.id === id))
    .filter(c => c !== undefined) as TestCase[];
});

const moveUp = (index: number) => {
  if (index > 0) {
    const newCases = [...formData.value.cases];
    // 获取实际用例ID
    const caseId = relatedCasesList.value[index].id;
    // 找到在原始cases数组中的位置
    const actualIndex = formData.value.cases.indexOf(caseId);
    
    // 交换位置
    [newCases[actualIndex], newCases[actualIndex - 1]] = 
      [newCases[actualIndex - 1], newCases[actualIndex]];
    
    formData.value.cases = newCases;
  }
}

const moveDown = (index: number) => {
  if (index < relatedCasesList.value.length - 1) {
    const newCases = [...formData.value.cases];
    const caseId = relatedCasesList.value[index].id;
    const actualIndex = formData.value.cases.indexOf(caseId);
    
    // 交换位置
    [newCases[actualIndex], newCases[actualIndex + 1]] = 
      [newCases[actualIndex + 1], newCases[actualIndex]];
    
    formData.value.cases = newCases;
  }
}

const addRelatedCases = () => {
  dialogFormVisible.value = true;
}

const relatedCaseIdSelect = ref<string>('')

const dialogFormVisible = ref(false)

const addToTable = () => {
  if (!relatedCaseIdSelect.value) {
    ElMessage.error('请选择用例')
    return
  }
  
  // 检查是否已存在
  if (formData.value.cases.includes(Number(relatedCaseIdSelect.value))) {
    ElMessage.warning('该用例已关联')
    // dialogFormVisible.value = false
    return
  }

  // 添加到 cases 数组
  formData.value.cases.push(Number(relatedCaseIdSelect.value))
  
  // 重置表单
  relatedCaseIdSelect.value = ''
  
  dialogFormVisible.value = false
}

const handleCloseRelatedCaseDialog = () => {
  dialogFormVisible.value = false
  relatedCaseIdSelect.value = ''
}

const removeRelatedCase = (row: TestCase) => {
  const caseId = row.id;
  // 从 cases 数组中移除
  formData.value.cases = formData.value.cases.filter(id => id !== caseId);
}



// 关联用例列表 配置 ================================================================


// 初始化数据
const initData = async () => {
  const rid = route.params.id
  if (rid && !isNaN(Number(rid))) {
    try {
      const res = await suiteApi.getSuiteDetail(Number(route.params.id))
      formData.value = res
    } catch (error) {
      router.back()
    }
  }
}

// 标题栏    ================================================================
// 提交处理
const handleSubmit = async () => {
  console.log('提交数据:', formData.value)
  try {
    await formRef.value?.validate()
    const res = await store.saveSuite(formData.value)
    if (res) {
      if (!formData.value.id) {
        router.push({ name: 'SuiteList' })
        originalData.value = null
        isEditing.value = false
      } else {
        isEditing.value = false
      }
      console.log('保存成功')
    }
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const handleCancel = () => {
  router.back()
  store.casesRelatedProject = []
}

const runCurrentSuite = async () => {
  if (!store.projectEnvsSelect) {
    ElMessage.error('请先选择项目')
    return
  }
  if (formData.value.cases.length === 0) {
    ElMessage.error('请先关联用例')
    return
  }
  
  try {
    const selectEnvInfo = projectStore.current?.envs.filter(env => env.id === Number(store.projectEnvsSelect))
    const res = await store.runSuite(Number(formData.value.id), selectEnvInfo[0].url)
    console.log('运行套件结果:', res)
    if (res) {
      ElMessage.success('任务已提交')
    }
    
  } catch (error) {
    console.error('运行套件失败:', error)
    ElMessage.error('运行套件失败，请稍后重试')
  }
}


onMounted(async () => {
  isEditing.value = !route.params.id
  await initData();
  

  // 确保 current 项目存在（支持刷新场景）
  if (!projectStore.currentProjectId) {
    await projectStore.initCurrentProject()
  }

  if (projectStore.currentProjectId) {
    await store.fetchCases(projectStore.currentProjectId);
  }
  
})

// 测试用例详情
const caseDrawer = ref();
const getCaseDetail = (caseId: number) => {
  caseDrawer.value.openDrawer(caseId);
}










</script>

<style scoped>
.suite-editor {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  min-width: 660px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color);
  color: rgb(175, 40, 40);
}

.header-title {
  font-size: 16px;
}

.editor-title {
  font-size: 18px;
  font-weight: 500;
}

.form-container {
  padding: 0 20px;

}

.run-env {
  width: 180px;
  padding-right: 4px;
}
.action-buttons {
  padding: 10px 0 10px 5px;
}

.base-title {
  color: rgb(109, 105, 105);
  text-align: left;
  padding: 0 2px 10px 0;
  display: flex;
  justify-content: space-between;
  margin-right: 40px;
}
.table-container {
  height: 300px; /* 固定高度 */
  overflow: auto; /* 添加滚动条 */
}
/* 添加操作按钮容器样式 */
.operation-buttons {
  display: flex;
  gap: 5px; /* 按钮间距 */
}


</style>