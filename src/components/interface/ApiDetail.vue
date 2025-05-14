<template>
    <div class="api-detail-container">
      <div class="request-line">
        <el-input 
          v-model="localDetail.name"
          class="path-input1"
          placeholder="请输入接口路径" 
          style="width: 220px;"
          />
        <el-button type="primary" @click="handleSaveInterface">保存</el-button>
      </div>
      <!-- 请求行 -->
      <div class="request-line">
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
        <el-input
          v-model="localDetail.path"
          class="path-input"
          placeholder="请输入接口路径"
        />
        <el-button
          type="primary"
          @click="handleSend"
          class="send-btn"
        >发送</el-button>
      </div>
  
      <!-- 标签页 -->
      <el-tabs v-model="activeTab">
        <!-- Headers 标签页 -->
        <el-tab-pane label="请求头" name="headers">
          <key-value-editor
            :items="localDetail.headers"
            @update:items="updateHandler('headers', $event)"
            key-placeholder="Header名称"
            value-placeholder="Header值"
          />
        </el-tab-pane>
  
        <!-- Params 标签页 -->
        <el-tab-pane label="参数" name="params">
          <key-value-editor
            :items="localDetail.params"
            @update:items="updateHandler('params', $event)"
            key-placeholder="参数名"
            value-placeholder="参数值"
          />
        </el-tab-pane>
      </el-tabs>

      <!-- 新增响应展示区域 -->
    <div class="response-section">
      <el-divider content-position="left">响应预览</el-divider>
      
      <el-skeleton :loading="loading" animated>
        <template #default>
          <div v-if="responseData" class="response-content">
            <el-descriptions border :column="1">
              <!-- 状态码 -->
              <el-descriptions-item label="状态码">
                <el-tag :type="statusType">
                  {{ responseData.status }}
                </el-tag>
              </el-descriptions-item>

              <!-- 响应头 -->
              <el-descriptions-item label="响应头">
                <key-value-viewer :data="responseData.headers" />
              </el-descriptions-item>

              <!-- 响应体 -->
              <el-descriptions-item label="响应体">
                <vue-json-pretty 
                  v-if="isJSON" 
                  :data="responseBody"
                  :deep=jsonDeep
                  showLength
                  showIcon
                  />
                <pre v-else class="raw-body">{{ responseBody }}</pre>
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

    </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, reactive, watch, nextTick } from 'vue'
  import KeyValueEditor from './KeyValueEditor.vue'
  import KeyValueViewer from './KeyValueViewer.vue'
  import VueJsonPretty from 'vue-json-pretty';
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
  
  interface ApiDetail {
    method: string
    path: string
    headers?: Record<string, string>
    params?: Record<string, string>
    name: string
    module: number | string
    id: number | string
  }
  
  const props = defineProps<{
    detail: ApiDetail
  }>()
  
  const emit = defineEmits(['send', 'save'])
  
  // 深拷贝初始化本地数据
  const localDetail = reactive<ApiDetail>({
    name: props.detail.name,
    module: props.detail.module,
    method: props.detail.method,
    path: props.detail.path,
    headers: props.detail.headers ? JSON.parse(JSON.stringify(props.detail.headers)) : {},
    params: props.detail.params ? JSON.parse(JSON.stringify(props.detail.params)) : {},
    id: props.detail.id
  })
  
  // 更新处理器（添加防抖）
  let updateLock = false
  const updateHandler = (type: 'headers' | 'params', value: Record<string, string>) => {
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
      params: newVal.params ? JSON.parse(JSON.stringify(newVal.params)) : {}
    })
  }, { deep: true })



// --------------------


// 新增响应数据类型
interface ResponseData {
  status: number
  headers: Record<string, string>
  body: any
  duration: number
}

// 新增状态变量
const loading = ref(false)
const responseData = ref<ResponseData | null>(null)

// 计算属性
const statusType = computed(() => {
  if (!responseData.value) return 'info'
  const status = responseData.value.status
  return status >= 500 ? 'danger' 
    : status >= 400 ? 'warning' 
    : status >= 200 ? 'success' 
    : 'info'
})

const responseBody = computed(() => {
  return responseData.value?.body || {}
})

const isJSON = computed(() => {
  try {
    JSON.parse(responseBody.value)
    return true
  } catch {
    return false
  }
})

const jsonDeep = ref(3)

// 修改保存处理函数
const handleSend = async () => {
  try {
    loading.value = true
    
    // 1. 保存配置
    // emit('send', {
    //   method: localDetail.method,
    //   path: localDetail.path,
    //   headers: localDetail.headers,
    //   params: localDetail.params
    // })

    // 2. 发送请求
    const startTime = Date.now()
    // const res = await interfaceApi.sendRequest({
    //   method: localDetail.method,
    //   url: localDetail.path,
    //   headers: localDetail.headers,
    //   params: localDetail.params
    // })
    const res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {'id': 0, 'name': 'test', 'age': 0, 'address': 'test', 'phone': 'test', 'email': 'test', 'updatedAt': '2023-10-01T00:00:00Z', 'createdAt': '2023-10-01T00:00:00Z', 'status': 'active',
        'description': 'test', 'tags': ['tag1', 'tag2'], 'extra': {'key': 'value'}
      }
    }
    
    // 3. 记录响应数据
    responseData.value = {
      status: res.status,
      headers: res.headers,
      body: res.data,
      duration: Date.now() - startTime
    }
    
  } catch (error: any) {
    ElMessage.error(`请求失败: ${error.message}`)
    responseData.value = {
      status: error.response?.status || 500,
      headers: error.response?.headers || {},
      body: error.response?.data || error.message,
      duration: 0
    }
  } finally {
    loading.value = false
  }
}

const handleSaveInterface = () => {
  // 处理保存接口逻辑
  // 例如：调用API保存接口配置
  console.log('保存接口 in api detail :', localDetail)
  // interfaceApi.saveInterface(localDetail)
  ElMessage.success('接口已保存！')
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
  
  .path-input {
    flex: 1;
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

.raw-body {
  white-space: pre-wrap;
  word-break: break-all;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

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

  </style>
  