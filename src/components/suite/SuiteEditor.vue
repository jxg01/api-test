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
            v-for="env in store.projectEnvs"
            :key="env.id"
            :label="env.name"
            :value="env.id"
          />
        </el-select>
        <el-button type="primary" @click="">运行</el-button>
        <template v-if="!isEditing">
          <el-button type="primary" @click="enterEditMode">编辑</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </template>
      </div>
    </div>

    <!-- 表单主体 -->
    <div class="form-container">
      <el-form 
        :model="formData" 
        label-width="120px" 
        ref="formRef"
      >
        <el-row :gutter="30">
          <el-col :span="10">
            <div class="base-title">
              <!-- <label>基础信息</label> -->
              <span class="editor-title"><el-icon><HomeFilled /></el-icon> 基础信息</span>
            </div>
            
            <el-form-item label="套件名称" prop="name">
              <el-input v-model="formData.name" :disabled="!isEditing" />
            </el-form-item>

            <el-form-item label="套件描述">
              <el-input type="textarea" v-model="formData.description" :disabled="!isEditing" />
            </el-form-item>

            <el-form-item label="套件状态" v-if="formData.execution_status">
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
            <el-card class="status-card">
              <BaseTable
              :columns="tableColumns"
              :table-data="relatedCasesList"
              :max-height="300"
              >
              <template #operation="scope" class="related-case-table">
                <el-button link @click="moveUp(scope.$index)" :disabled="!isEditing"><el-icon><CaretTop /></el-icon></el-button>
                <el-button link @click="moveDown(scope.$index)" :disabled="!isEditing"><el-icon><CaretBottom /></el-icon></el-button>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent=""
                  class="action-buttons"
                  :disabled="!isEditing"
                  >
                移除
                </el-button>
              </template>
            
            </BaseTable>
            </el-card>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { suiteApi } from '@/api'
import { useSuiteStore, Suite, TestCase } from '@/stores/suiteStore'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'

// 表单数据
const formData = ref<Suite>({
  id: '',
  name: '',
  description: '',
  execution_status: '',
  cases: [],
  project: ''
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
    selectedCases.value = [...formData.value.cases].map(String)
  }
}
// 页面只读配置 ================================================================
// 关联用例列表 配置 ================================================================
const tableColumns: TableColumn[] = [
  // { prop: 'id', label: 'ID', width: 60 },
  { prop: 'name', label: '用例名称' },
  { prop: 'operation', label: '操作', width: 130, slot: 'operation' }
]

// 关联用例列表 ================================================================
const relatedCasesList = computed(() => {
  // 根据 formData.value.cases 的顺序过滤和排序
  return formData.value.cases
    .map(id => store.allCases.find((c: TestCase) => c.id === id))
    .filter(c => c !== undefined) as TestCase[];
});

// watch(() => formData.value.cases, (newVal) => {
//   // 当cases变化时自动更新关联列表
//   console.log('关联用例更新:', newVal)
// }, { deep: true })

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
  console.log('in addRelatedCases')
}
// 关联用例列表 配置 ================================================================

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()

const store = useSuiteStore()



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

// 提交处理
const handleSubmit = async () => {
  console.log('in submit1 ', formData.value)
  console.log('envs ', store.projectEnvsSelect)
  isEditing.value = false
  originalData.value = null
  console.log('in submit2 ', formData.value)
  // try {
  //   if (route.params.id) {
  //     await suiteApi.update(formData.value)
  //     ElMessage.success('更新成功')
  //   } else {
  //     await suiteApi.create(formData.value)
  //     ElMessage.success('创建成功')
  //   }
  //   router.push({ name: 'SuiteList' })
  // } catch (error) {
  //   console.error('保存失败:', error)
  // }
}

const handleCancel = () => {
  router.back()
  store.projectEnvs = []
}



// 用例选择区域
const caseOptions = ref<Array<{
  key: string
  label: string
  // creator: string
}>>([])

const selectedCases = ref<string[]>(
  formData.value.cases.map(String)
)

// 同步外部值变化
watch(() => formData.value.cases, (newVal) => {
  // 使用扩展运算符创建新数组触发响应式更新
  selectedCases.value = [...newVal].map(String)
}, { 
  deep: true, // 深度监听数组变化
  immediate: true // 初始化立即执行
})



onMounted(async () => {
  isEditing.value = !route.params.id
  await initData();
  await store.fetchCases();
  if (formData.value.project) {
    await store.fetchEnvs(formData.value.project)
  }
  caseOptions.value = store.allCases.map((c: TestCase) => ({
    key: String(c.id),  // 转换为字符串
    label: c.name,
  }))
  // 强制同步初始值
  selectedCases.value = [...formData.value.cases].map(String)

})












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


</style>