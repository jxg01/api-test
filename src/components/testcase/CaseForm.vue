<template>
  <div>
    <el-form
    :model="localCaseDetail"
    ref="formRef"
    label-width="100px"
    class="case-detail-form"
    :rules="rules"
    >
      <el-card shadow="hover">
        <div class="table-header">
          <span class="table-title">基础信息</span>
          <div class="right-actions">
            <div class="run-action" v-if="localCaseDetail.id">
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
              <el-button type="primary" @click="submitRunTestCase" :loading=runLoading :disabled="store.projectEnvsSelect?false:true">运行</el-button>
            </div>
            <el-button class="save-bt" type="primary" @click="submit" :disabled="!isFormDirty">保存</el-button>
          </div>  
        </div>
        <template v-if="!localCaseDetail.id">
          <el-form-item label="关联接口" prop="interface">
            <el-select
              v-model="localCaseDetail.interface"
              placeholder="选择接口"
              class="type-select"
              filterable
            >
              <el-option
                v-for="api in store.interFaceList"
                :key="api.id"
                :label="api.name"
                :value="api.id"
              />
            </el-select>
          </el-form-item>
        </template>

        
        <el-form-item label="用例名称" prop="name" required>
          <el-input v-model="localCaseDetail.name" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="localCaseDetail.enabled">
            <el-radio :value=true>启用</el-radio>
            <el-radio :value=false>禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用例描述" prop="description">
          <el-input v-model="localCaseDetail.description" type="textarea" />
        </el-form-item>

        <el-form-item>
          <el-tabs v-model="activeTab" class="api-data" >
            <el-tab-pane label="请求头" name="headers">
              <key-value-editor
                :items="localCaseDetail.headers"
                @update:items="updateHandler('headers', $event)"
                key-placeholder="Header名称"
                value-placeholder="Header值"
              />
            </el-tab-pane>
      
            <el-tab-pane label="参数" name="params">
              
              <key-value-editor
                :items="localCaseDetail.params"
                @update:items="updateHandler('params', $event)"
                key-placeholder="Header名称"
                value-placeholder="Header值"
              />
            </el-tab-pane>

            <el-tab-pane label="请求体" name="body">
              <div class="body-type-selector">
                <el-radio-group v-model="localCaseDetail.body_type" class="body-type-selector">
                  <el-radio value="form">Form Data</el-radio>
                  <el-radio value="raw">Raw</el-radio>
                </el-radio-group>
                <el-button type="info" @click.stop="formatJson" v-if="localCaseDetail.body_type === 'raw'"><el-icon><BrushFilled /></el-icon>格式化</el-button>
              </div>
              <key-value-editor
                v-if="localCaseDetail.body_type === 'form'"
                :items="localCaseDetail.data"
                @update:items="updateHandler('data', $event)"
                key-placeholder="Header名称"
                value-placeholder="Header值"
              />
              <div>
                <baseEditor 
                v-if="localCaseDetail.body_type === 'raw'"
                v-model="localCaseDetail.body" 
                lang="json" 
                height="400px" 
                theme="monokai" 
                :options="{ tabSize: 2 }"
                :additional-values="store.pythonFunctionList" 
              />
              </div>
              
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
        
        <el-form-item label="断言" prop="assertions" class="assertion-line">
          <div class="assertion-list">
            <div v-for="(assertion, index) in localCaseDetail.assertions" :key="index" class="assertion-item">
              <el-select 
                v-model="assertion.type" 
                placeholder="选择断言类型"
                class="type-select"
                @change="handleAssertionTypeChange(index)"
              >
                <el-option
                  v-for="type in assertionTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
      
              <template v-if="assertion.type === 'status_code'">
                <el-input
                  v-model="assertion.expected"
                  placeholder="期望状态码"
                />
              </template>
      
              <template v-if="assertion.type === 'jsonpath_equal'">
                <el-input
                  v-model="assertion.path"
                  placeholder="JSONPath表达式"
                  style="margin-right: 8px"
                />
                <el-input
                  v-model="assertion.expected"
                  placeholder="期望值"
                />
              </template>
      
              <el-button
                type="danger"
                circle
                :icon="Delete"
                @click="removeAssertion(index)"
                class="delete-btn"
              />
            </div>
            <el-button
              type="primary"
              plain
              @click="addAssertion"
              class="add-btn"
            >
              添加断言
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="参数提取" prop="variable_extract">
          <div class="extract-list">
            <div v-for="(extract, index) in localCaseDetail.variable_extract" :key="index" class="extract-item">
              <el-select
                v-model="extract.type"
                placeholder="选择提取类型"
                class="type-select"
              >
                <el-option
                  v-for="type in extractTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
      
              <template v-if="extract.type">
                <el-input
                  v-model="extract.name"
                  placeholder="提取参数保存变量名称"
                  style="margin: 0 8px"
                />
                <el-input
                  v-model="extract.path"
                  :placeholder="extract.type === 'jsonpath'?'JSONPath表达式': '正则表达式'"
                />
              </template>
      
              <el-button
                type="danger"
                circle
                :icon="Delete"
                @click="removeExtract(index)"
                class="delete-btn"
              />
            </div>
            <el-button
              type="primary"
              plain
              @click="addExtract"
              class="add-btn"
            >
              添加提取规则
            </el-button>
          </div>
        </el-form-item>
      </el-card>
      <case-execute-history v-if="localCaseDetail.id" :table-info="store.caseHistoryList" @handleRefresh="refreshHistory"></case-execute-history>
    </el-form>
    
  </div>
</template>
<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { reactive, nextTick, ref, onMounted, computed  } from 'vue';
import { EditTab, TestCase, useCaseStore } from '@/stores/testcase';
import { ElMessage, type DialogContext, type FormInstance, type FormRules } from 'element-plus'
import KeyValueEditor from '@/components/interface/KeyValueEditor.vue'
import CaseExecuteHistory from './CaseExecuteHistory.vue';
import _ from 'lodash'; // 引入 lodash 用于深度比较
import baseEditor from '@/components/BaseEditor.vue'
import { useProjectStore } from '@/stores/project';

const store = useCaseStore()
const projectStore = useProjectStore()

  // 断言类型配置
const assertionTypes = [
  { value: 'status_code', label: '状态码' },
  { value: 'jsonpath_equal', label: '提取值等于' },
  { value: 'jsonpath_not_equal', label: '提取值不等于' },
  { value: 'response_contain', label: '结果包含' },
]
  // 参数提取类型配置
const extractTypes = [
  { value: 'regex', label: '正则表达式' },
  { value: 'jsonpath', label: 'JSONPath' }
]

const props = defineProps<{
  // formData: TestCase
  tabInfo: EditTab
}>()

const localCaseDetail = reactive<TestCase>({
  id: props.tabInfo.formData.id,
  name: props.tabInfo.formData.name,
  description: props.tabInfo.formData.description,
  enabled: props.tabInfo.formData.enabled,
  
  headers: props.tabInfo.formData.headers ? JSON.parse(JSON.stringify(props.tabInfo.formData.headers)) : {},
  params: props.tabInfo.formData.params ? JSON.parse(JSON.stringify(props.tabInfo.formData.params)) : {},

  body_type: props.tabInfo.formData.body_type || 'form',
  data: props.tabInfo.formData.data ? JSON.parse(JSON.stringify(props.tabInfo.formData.data)) : {},
  body: props.tabInfo.formData.body ? props.tabInfo.formData.body : '{}',


  assertions: props.tabInfo.formData.assertions,
  variable_extract: props.tabInfo.formData.variable_extract,
  // project: '',
  interface: '',
})

// 添加初始数据副本用于比较
const initialData = ref(JSON.parse(JSON.stringify(localCaseDetail)))

// 创建计算属性判断表单是否有变动
const isFormDirty = computed(() => {
  return !_.isEqual(localCaseDetail, initialData.value)
})

// 初始化断言条目
const addAssertion = () => {
  localCaseDetail.assertions.push({
    type: '',
    expected: '',
    path: ''
  })
}
// 初始化参数提取条目
const addExtract = () => {
  localCaseDetail.variable_extract.push({
    type: '',
    name: '',
    path: ''
  })
}
// 删除断言条目
const removeAssertion = (index: number) => {
localCaseDetail.assertions.splice(index, 1)
}

// 删除参数提取条目
const removeExtract = (index: number) => {
  localCaseDetail.variable_extract.splice(index, 1)
}
// 处理断言类型变化
const handleAssertionTypeChange = (index: number) => {
const assertion = localCaseDetail.assertions[index]
  // 重置相关字段
  switch(assertion.type) {
    case 'status_code':
      delete assertion.path
      break
    case 'jsonpath_equal':
      assertion.path = ''
      break
  }
}



 // 更新处理器（添加防抖）
let updateLock = false
const updateHandler = (type: 'headers' | 'params' | 'data', value: Record<string, string>) => {
  if (updateLock) return
  
  updateLock = true
  nextTick().then(() => {
    localCaseDetail[type] = value
    updateLock = false
  })
}

const activeTab = ref('headers')

const formRef = ref<FormInstance>()
// 校验规则定义
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '用例名称不能为空', trigger: 'blur' },
    // { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '用例描述不能为空', trigger: 'blur' },
  ],
  // project: [
  //   { required: true, message: '请选择关联项目', trigger: 'change' }
  // ],
  interface: [
    { required: true, message: '请选择关联接口', trigger: 'change' }
  ],

})


const submit = async () => {
  try {
    console.log('提交表单:', localCaseDetail)
    await formRef.value?.validate()
    const newTabInfo = {
      'title': props.tabInfo.title,
      'name': props.tabInfo.name,
      'formData': localCaseDetail
    }
    store.saveCase(newTabInfo)
    ElMessage.success('保存成功')
    store.fetchCaseList()

    // 保存成功后更新初始数据
    initialData.value = JSON.parse(JSON.stringify(localCaseDetail))
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 执行按钮loading状态
const runLoading = ref<boolean>(false)

const submitRunTestCase = async () => {
  try {
    if (!store.projectEnvsSelect) {return}
    runLoading.value = true
    const selectEnvInfo = projectStore.current?.envs.filter((env: {id: number}) => env.id === Number(store.projectEnvsSelect))
    const res = await store.runTestcase(Number(localCaseDetail.id), selectEnvInfo[0]?.url)
    if (res) {
      ElMessage.success('提交成功')
    }
    
    runLoading.value = false
  } catch (error) {
    ElMessage.error('提交失败')
    console.error(error)
    runLoading.value = false
  }
}

const refreshHistory = () => {
  store.fetchTestCaseHistory(Number(localCaseDetail.id))
  console.log('in refreshHistory')
}

// 格式化 JSON 数据
const formatJson = () => {
  try {
    const parsed = JSON.parse(localCaseDetail.body)
    localCaseDetail.body = JSON.stringify(parsed, null, 2)
    ElMessage.success('格式化成功')
  } catch (err) {
    ElMessage.error('无效的 JSON 格式，无法格式化')
  }
}

onMounted(() => {
  console.error('onMounted => ', localCaseDetail.id)
  if (localCaseDetail.id) {
    store.fetchTestCaseHistory(Number(localCaseDetail.id))
  }
  
})

</script>
<style scoped>
.form-view {
  width: 90%;
  margin: 20px auto;
  padding: 20px;
  border: 2px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 3px 3px 15px #bca5be;
}

.case-detail-form {
  /* width: 70%; */
  padding: 20px;
  margin: auto;
  align-items: center;
}
  .assertion-list,
  .extract-list {
  width: 100%;
  }
  .assertion-item,
  .extract-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
  }
  .type-select {
  width: 180px;
  }
  .delete-btn {
  margin-left: auto;
  }
  .add-btn {
  margin-top: 12px;
  }
  .el-input {
  flex: 1;
  }

  .api-data {
    margin: 20px 0;
    width: 100%;
  }
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .run-action {
  display: flex;
  gap: 8px; /* 运行按钮与环境选择器的间距 */
}

  .run-env {
  width: 180px;
  margin-right: auto;
}

.raw-body {
  white-space: pre-wrap;
  word-break: break-all;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}
.right-actions {
  display: flex;
  align-items: center;
  gap: 12px; /* 元素间距 */
}

.body-type-selector {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}

  </style>