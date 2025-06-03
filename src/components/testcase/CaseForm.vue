<template>
  <div>
    <el-form
    :model="localCaseDetail"
    ref="formRef"
    label-width="100px"
    class="case-detail-form"
    >
      <el-card shadow="hover">
        <div class="table-header">
          <span class="table-title">基础信息</span>
          <div class="run-action" v-if="localCaseDetail.id">
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
            <el-button type="primary" @click="submitRunTestCase" :loading=runLoading :disabled="store.projectEnvsSelect?false:true">运行</el-button>
          </div>
          
        </div>
        <template v-if="!localCaseDetail.id">
          <el-form-item label="关联项目" prop="name">
            <el-select
              v-model="store.caseDetailProjectId"
              placeholder="选择项目"
              @change="store.handleProjectChange"
              class="type-select"
            >
              <el-option
                v-for="project in store.apiStoreInstance.projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="关联接口" prop="name">
            <el-select
              v-model="store.caseDetailInterId"
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
              <key-value-editor
                :items="localCaseDetail.body"
                @update:items="updateHandler('body', $event)"
                key-placeholder="Header名称"
                value-placeholder="Header值"
              />
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

        <el-form-item>
          <el-button type="primary" @click="submit">保存</el-button>
        </el-form-item>
      </el-card>
      <case-execute-history v-if="localCaseDetail.id" :table-info="store.caseHistoryList" @handleRefresh="refreshHistory"></case-execute-history>
    </el-form>
    
  </div>
</template>
<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { reactive, nextTick, ref, onMounted  } from 'vue';
import { EditTab, TestCase, useCaseStore } from '@/stores/testcase';
import { ElMessage, type DialogContext, type FormInstance, type FormRules } from 'element-plus'
import KeyValueEditor from '@/components/interface/KeyValueEditor.vue'
import CaseExecuteHistory from './CaseExecuteHistory.vue';

const store = useCaseStore()

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
  body: props.tabInfo.formData.body ? JSON.parse(JSON.stringify(props.tabInfo.formData.body)) : {},

  assertions: props.tabInfo.formData.assertions,
  variable_extract: props.tabInfo.formData.variable_extract,
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
const updateHandler = (type: 'headers' | 'params' | 'body', value: Record<string, string>) => {
  if (updateLock) return
  
  updateLock = true
  nextTick().then(() => {
    localCaseDetail[type] = value
    updateLock = false
  })
}

const activeTab = ref('headers')

const formRef = ref<FormInstance>()

const submit = async () => {
  try {
    await formRef.value?.validate()
    const newTabInfo = {
      'title': props.tabInfo.title,
      'name': props.tabInfo.name,
      'formData': localCaseDetail
    }
    store.saveCase(newTabInfo)
    ElMessage.success('保存成功')
    store.fetchCaseList()
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
    const selectEnvInfo = store.projectEnvs.filter(env => env.id === Number(store.projectEnvsSelect))
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

onMounted(() => {
  console.error('onMounted => ', localCaseDetail.id)
  store.fetchEnvs()
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
    justify-content: space-between;
  }

  .run-env {
  width: 180px;
  padding-right: 8px;
}

.raw-body {
  white-space: pre-wrap;
  word-break: break-all;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

  </style>