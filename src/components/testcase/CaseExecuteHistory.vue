<template>
  <div>
    <!-- 底部最近执行记录 -->
    <el-card shadow="hover" class="execution-table">
      <div class="table-header">
        <span class="table-title">最近执行记录【10条】</span>
        <el-button type="primary" size="small" @click="emit('handleRefresh')">刷新</el-button>
      </div>
      <BaseTable
        :columns="historyListTableColumns"
        :table-data="props.tableInfo"
        height="auto"
      >
        <template #StatusTagInlist="scope">
          <el-tag :type="getStatusType(scope.row.status)" effect="dark"> {{ getStatusDisplayName(scope.row.status) }} </el-tag>
        </template>
        <template #operation="scope">
          <el-button link type="primary" @click="viewDetail(scope.row)">详情</el-button>
        </template>
      </BaseTable>
    </el-card>

    <el-dialog title="记录详情" v-model="detailVisit" width="70%">
        <!-- 新增响应展示区域 -->
    <div class="request-detail">
      <el-divider content-position="left"><span class="content-title">请求信息</span></el-divider>
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
                <key-value-viewer :data="requestData.headers" />
              </el-descriptions-item>

              <!-- 响应体 -->
              <el-descriptions-item label="请求参数">
                <key-value-viewer :data="requestData.data" />
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

      <el-divider content-position="left"><span class="content-title">响应信息</span></el-divider>
      <el-skeleton :loading="loading" animated>
        <template #default>
          <div v-if="responseData">
            <el-descriptions border :column="1" class="response-info">
              <!-- 状态码 -->
              <el-descriptions-item label="状态码" width="100">
                <el-tag>
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

      <!-- 断言区域 -->
      <el-divider content-position="left"><span class="content-title">断言</span></el-divider>
      <el-skeleton :loading="loading" animated>
        <template #default>
          <div v-if="assertionData">
            <BaseTable
              :columns="detailTableColumns"
              :table-data="assertionData"
              height="auto"
            >
              <template #StatusTag="scope">
                <el-tag :type="scope.row.status === 'success' ?'primary': 'danger'" effect="dark"> {{ scope.row.status === "success" ? '成功': '失败' }} </el-tag>
              </template>
            </BaseTable>
          </div>
        </template>
      </el-skeleton>

      <el-divider content-position="left" style="margin: 30px 0;"><span class="content-title">提取变量</span></el-divider>
      <el-skeleton :loading="loading" animated>
        <template #default>
          <div v-if="extratedData">
            <key-value-viewer :data="extratedData" :width="300" :key-label="'变量名称'" :value-label="'提取值'" />
          </div>
        </template>
      </el-skeleton>

    </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { testCaseHistory, responseDataType, requestDataType} from '@/stores/testcase';
import { ref, computed } from 'vue';
import KeyValueViewer from '../interface/KeyValueViewer.vue'
import VueJsonPretty from 'vue-json-pretty';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import { ro } from 'element-plus/es/locale';

const emit = defineEmits(['handleRefresh'])
const props = defineProps<{
  // formData: TestCase
  tableInfo: []
}>()

// 表格配置
const detailTableColumns: TableColumn[] = [
  { prop: 'type', label: '断言类型' },
  { prop: 'enabled', label: '状态', width: 100, slot: 'StatusTag' },
  { prop: 'expected', label: '预期结果' },
  { prop: 'actual', label: '实际结果' },
]

// 表格配置
const historyListTableColumns: TableColumn[] = [
  { prop: 'id', label: '#', width: 80 },
  { prop: 'executed_by', label: '执行人'},
  { prop: 'created_at', label: '执行时间' },
  { prop: 'duration', label: '耗时(s)' },
  { prop: 'status', label: '状态', slot: 'StatusTagInlist' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]


// 获取状态标签类型, 不同标签显示不同颜色
const getStatusType = (status: string) => {
  switch (status) {
    case 'passed':
      return 'success'
    case 'failed':
      return 'danger'
    case 'running':
      return 'warning'
  }
}

const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'passed':
      return '成功'
    case 'failed':
      return '失败'
    case 'running':
      return '执行中'
  }
}

const loading = ref<boolean>(false)
const detailVisit = ref<boolean>(false)

const responseData = ref<responseDataType>()
const requestData = ref<requestDataType>()
const assertionData = ref()
const extratedData = ref()

// 查看详情
const viewDetail = (row: testCaseHistory) => {
  console.log('查看执行详情:', row)
  // 实际项目中这里可以跳转到详情页
  responseData.value = row.response_data
  requestData.value = row.request_data
  assertionData.value = row.assertions_result
  extratedData.value = row.extracted_vars
  detailVisit.value = true
}

const responseBody = computed(() => {
  try {
    return JSON.parse(responseData.value?.body) || {}
  } catch (error) {
    return responseData.value?.body || {}
  }
})




</script>


<style>
.execution-table {
  margin-top: 20px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.table-title {
  font-size: 16px;
  font-weight: bold;
}

.request-detail {
  word-break: break-all;  /* 强制截断单词 */
  overflow-wrap: anywhere;  /* 更智能的断词 */
}

.json-container {
  background: #f8f8f8;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}
pre {
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  color: #333;
}

.content-title {
  font-size: large;
  font-weight: bold;
}

.request-detail {
  padding: 20px;
}


</style>

