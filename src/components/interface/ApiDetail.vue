<template>
    <div class="api-detail-container">
      <el-form 
      ref="formRef" 
      :model="localDetail" 
      :rules="rules" 
      >
        <div class="request-line">
          <el-form-item prop="name">
            <el-input
              v-model="localDetail.name"
              class="interface-name"
              placeholder="请输入接口名称"
            />
          </el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>

        <div class="request-line">
          <el-form-item prop="path" class="path-form-item">
            <el-input
              v-model="localDetail.path"
              class="path-input"
              placeholder="请输入接口路径"
            >
              <template #prepend=>
                <el-select 
                  v-model="localDetail.method" 
                  class="method-select"
                  placeholder="Method"
                >
                  <el-option
                    v-for="m in methods"
                    :key="m"
                    :label="m"
                    :value="m"
                  />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
          <el-dropdown trigger="click" @command="handleCommand">
            <el-button type="primary" class="send-btn">调试一下</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="item in store.envs" :key="item.id" :command="item.url">{{ item.name }}: {{ item.url }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </div>
      </el-form>
  
      <!-- 标签页 -->
      <el-tabs v-model="activeTab">
        <!-- Headers 标签页 -->
        <el-tab-pane label="headers" name="headers">
          <key-value-editor
            :items="localDetail.headers"
            @update:items="updateHandler('headers', $event)"
            key-placeholder="Header名称"
            value-placeholder="Header值"
          />
        </el-tab-pane>
  
        <!-- Params 标签页 -->
        <el-tab-pane label="params" name="params">
          <key-value-editor
            :items="localDetail.params"
            @update:items="updateHandler('params', $event)"
            key-placeholder="参数名"
            value-placeholder="参数值"
          />
        </el-tab-pane>

        <!-- body 标签页 -->
        <el-tab-pane label="body" name="body">
          <el-radio-group v-model="localDetail.body_type" class="body-type-selector">
            <el-radio value="form">Form Data</el-radio>
            <el-radio value="raw">Raw</el-radio>
          </el-radio-group>

          <!-- Form Data 模式 @update:items="updateFormData" -->
          <key-value-editor
            v-if="localDetail.body_type === 'form'"
            :items="localDetail.data"
            @update:items="updateHandler('data', $event)"
          />
          <!-- Raw 模式 -->
          <div v-else-if="localDetail.body_type === 'raw'">
            <baseEditor 
            v-model="localDetail.body" 
            lang="json" 
            height="200px" 
            theme="monokai" 
            :options="{ tabSize: 4 }" 
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 新增响应展示区域 -->
    <div class="response-section">
      <el-divider content-position="left">请求预览</el-divider>
      <el-skeleton :loading="loading" animated>
              <template #default>
                <div v-if="requestData">
                  <el-descriptions border :column="1">
                    <!-- 状态码 -->
                    <el-descriptions-item label="请求地址"  width="100">
                      <span> {{ requestData.url }} </span>
                    </el-descriptions-item>
                    <!-- 状态码 -->
                    <el-descriptions-item label="请求方式">
                      <el-tag>
                        {{ requestData.method }}
                      </el-tag>
                    </el-descriptions-item>

                    <!-- 响应头 -->
                    <el-descriptions-item label="请求头">
                      <key-value-viewer :data="requestData.headers" :width="300" />
                    </el-descriptions-item>

                    <!-- 响应体 -->
                    <el-descriptions-item label="请求参数">
                      <key-value-viewer :data="requestData.data" :width="300" />
                    </el-descriptions-item>

                    <!-- 响应体 -->
                    <el-descriptions-item label="请求体">
                      <key-value-viewer :data="requestData.json" :width="300"/>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

                <div v-else class="empty-response">
                  <el-empty description="暂无数据" />
                </div>
              </template>
              
              <template #template>
                <el-skeleton-item variant="text" style="width: 30%" />
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" style="width: 60%" />
              </template>
            </el-skeleton>

      <el-divider content-position="left">响应预览</el-divider>
      <el-skeleton :loading="loading" animated>
              <template #default>
                <div v-if="responseData">
                  <el-descriptions border :column="1" class="response-info">
                    <!-- 状态码 -->
                    <el-descriptions-item label="状态码" width="100">
                      <el-tag :type="statusType">
                        {{ responseData.status_code }}
                      </el-tag>
                    </el-descriptions-item>

                    <!-- 响应头 -->
                    <el-descriptions-item label="响应头">
                      <key-value-viewer :data="responseData.headers" :width="300"/>
                    </el-descriptions-item>

                    <!-- 响应体 -->
                    <el-descriptions-item label="响应体">
                        <pre class="raw-body">{{ responseBody }}</pre>
                        <!-- </div> -->
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

                <div v-else class="empty-response">
                  <el-empty description="暂无数据" />
                </div>
              </template>
            </el-skeleton>

    </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, reactive, watch, nextTick } from 'vue'
  import KeyValueEditor from './KeyValueEditor.vue'
  import KeyValueViewer from './KeyValueViewer.vue'
  import VueJsonPretty from 'vue-json-pretty';
  import { ElMessage } from 'element-plus'
  import { useInterfaceStore } from '@/stores/interface'
  import type { FormInstance, FormRules } from 'element-plus'
  import baseEditor from '@/components/BaseEditor.vue'
  import { interfaceApi } from '@/api'

  // 添加表单引用
const formRef = ref<FormInstance>()

// 校验规则定义
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '接口名称不能为空', trigger: 'blur' },
    // { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '接口路径不能为空', trigger: 'blur' },
    // { 
    //   pattern: /^\/[a-zA-Z0-9_\-/]+$/,
    //   message: '路径格式不正确，应以/开头，可包含字母、数字、-、_',
    //   trigger: 'blur'
    // }
  ],
})

  const store = useInterfaceStore()
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
  
  interface ApiDetail {
    method: string | 'GET'
    path: string
    headers?: Record<string, string>
    params?: Record<string, string>
    body_type?: 'form' | 'raw'
    body: string
    data?: Record<string, any>
    name: string
    module: number | string
    id: number | string
  }
  
  const props = defineProps<{
    detail: ApiDetail
  }>()
  
  // 深拷贝初始化本地数据
  const localDetail = reactive<ApiDetail>({
    name: props.detail.name,
    module: props.detail.module,
    method: props.detail.method,
    path: props.detail.path,
    headers: props.detail.headers ? JSON.parse(JSON.stringify(props.detail.headers)) : {},
    params: props.detail.params ? JSON.parse(JSON.stringify(props.detail.params)) : {},
    body: props.detail.body ? JSON.stringify(props.detail.params) : '{"a": 1}',
    data: props.detail.body ? JSON.parse(JSON.stringify(props.detail.body)) : {},
    body_type: 'form', // 默认使用form-data
    id: props.detail.id
  })
  
  // 更新处理器（添加防抖）
  let updateLock = false
  const updateHandler = (type: 'headers' | 'params' | 'data', value: Record<string, string>) => {
    if (updateLock) return
    
    updateLock = true
    nextTick().then(() => {
      localDetail[type] = value
      updateLock = false
    })
  }
  
  const activeTab = ref('headers')
  
  // 监听props变化（使用深拷贝）
  watch(() => props.detail, (newVal) => {
    Object.assign(localDetail, {
      method: newVal.method,
      path: newVal.path,
      headers: newVal.headers ? JSON.parse(JSON.stringify(newVal.headers)) : {},
      params: newVal.params ? JSON.parse(JSON.stringify(newVal.params)) : {},
      name: newVal.name,
    })
  }, { deep: true })

// 新增响应数据类型
interface ResponseData {
  status_code: number
  headers: Record<string, string>
  body: any
  duration: number
}

// 新增状态变量
const loading = ref(false)
const responseData = ref<ResponseData | null>(null)
const requestData = ref<any>(null) // 请求数据类型可以根据实际情况定义

// 计算属性
const statusType = computed(() => {
  if (!responseData.value) return 'info'
  const status = responseData.value.status_code
  return status >= 500 ? 'danger' 
    : status >= 400 ? 'warning' 
    : status >= 200 ? 'success' 
    : 'info'
})

const responseBody = computed(() => {
  try {
    return JSON.parse(responseData.value?.body) || {}
  } catch (error) {
    return responseData.value?.body || {}
  }
})


const jsonDeep = ref(3)

function isObject(value: any) {
  return value !== null && typeof value === 'object';
}




const handleCommand = async (command: string) => {
  if (!localDetail.path) {
    ElMessage.error('接口路径不能为空')
    return
  }
  const payload = {
    'method': localDetail.method,
    'url': command + localDetail.path,
    'headers': localDetail.headers,
    'params': localDetail.params,
    'body_type': localDetail.body_type,
    'data': localDetail.data,
    'body': localDetail.body
  }
  console.log('发送请求的payload:', payload)
  try {
    loading.value = true
    // 发送请求
    const res = await interfaceApi.runInterface(payload)
    responseData.value = res.data.response_data
    requestData.value = res.data.request_data
    ElMessage.success('请求成功')
    loading.value = false

  } catch (error) {
    loading.value = false
    ElMessage.error('error')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    store.handleSaveInterface(localDetail)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败', error)
  }
}



  </script>
  
  <!-- 保持样式不变 -->
  
  <style scoped>
  .api-detail-container {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .request-line {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .method-select {
    width: 120px;
  }

  .send-btn {
    width: 100px;
  }
  
  :deep(.el-tabs__header) {
    margin: 0 0 15px;
  }
  
  /* 结果页面 */
  .response-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.response-content {
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* .raw-body {
  white-space: pre-wrap;
  word-break: break-all;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
} */

.empty-response {
  padding: 40px 0;
  background: white;
}

.title-save {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
  .interface-name {
    width: 250px;
  }
  .path-form-item {
    flex: 1;
  }
  /* 新增校验相关样式 */
:deep(.el-form-item__error) {
  padding-top: 4px;
}

.body-type-selector {
  margin-bottom: 15px;
  display: flex;
}

pre {
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  color: #333;
}
  </style>
  