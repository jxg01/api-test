<template>
  <!-- 在其他页面调用这个组件 -->
  <div class="customer-header">
  <el-drawer
    v-model="drawerVisible"
    direction="rtl"
    size="900"
    @open="activeName='first'"
  >
    <template #header>
      <div class="customer-title" style="display: flex; text-align: center;">
        <svg style="margin-right: 10px; width: 24px; height: 24px;">
          <circle cx="12" cy="12" r="10 " :fill="status==='passed'?'lightgreen':'red'" />
        </svg>
        <h4>测试结果 - {{ title }}</h4>
      </div>
      
    </template>
    <div class="request-detail">
        <el-tabs v-model="activeName" class="demo-tabs">
          <el-tab-pane label="请求信息" name="first">
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

                    <!-- 查询参数 -->
                    <el-descriptions-item label="查询参数">
                      <key-value-viewer :data="requestData.params" />
                    </el-descriptions-item>

                    <!-- 响应体 -->
                    <el-descriptions-item label="请求参数">
                      <key-value-viewer :data="requestData.data" />
                    </el-descriptions-item>

                    <!-- 响应体 -->
                    <el-descriptions-item label="请求体">
                      <!-- <key-value-viewer :data="requestData.json" /> -->
                      <pre class="raw-body">{{ requestData.json?requestData.json:'暂无数据' }}</pre>
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
          </el-tab-pane>
          <el-tab-pane label="响应信息" name="second">
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
          </el-tab-pane>
          <el-tab-pane label="断言" name="third">
            <el-skeleton :loading="loading" animated>
              <template #default>
                <div v-if="assertionData">
                  <BaseTable
                    :columns="detailTableColumns"
                    :table-data="assertionData"
                    height="auto"
                  >
                    <template #assertType="scope">
                      <span>{{ getAssertionTypeLabel(scope.row.type) }}</span>
                    </template>
                    <template #StatusTag="scope">
                      <el-tag :type="scope.row.status === 'success' ?'primary': 'danger'" effect="dark"> {{ scope.row.status === "success" ? '成功': '失败' }} </el-tag>
                    </template>
                  </BaseTable>
                </div>
              </template>
            </el-skeleton>
          </el-tab-pane>
          <el-tab-pane label="提取变量" name="fourth">
            <el-skeleton :loading="loading" animated>
              <template #default>
                <div v-if="extratedData">
                  <key-value-viewer :data="extratedData" :width="300" :key-label="'变量名称'" :value-label="'提取值'" />
                </div>
              </template>
            </el-skeleton>
          </el-tab-pane>
        </el-tabs>
        
      </div>
  </el-drawer>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { responseDataType, requestDataType } from '@/stores/testcase';
import { suiteApi } from '@/api';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'


// 断言类型配置
const assertionTypes = [
  { value: 'status_code', label: '状态码' },
  { value: 'jsonpath_equal', label: '提取值等于' },
  { value: 'jsonpath_not_equal', label: '提取值不等于' },
  { value: 'response_contain', label: '结果包含' },
];

// 参数提取类型配置
const extractTypes = [
  { value: 'regex', label: '正则表达式' },
  { value: 'jsonpath', label: 'JSONPath' }
];

const emit = defineEmits(['update:visible']);



// 获取断言类型标签
const getAssertionTypeLabel = (type: string) => {
  const typeObj = assertionTypes.find(t => t.value === type);
  return typeObj ? typeObj.label : type;
};

const drawerVisible = ref(false);
const loading = ref(false);
const activeName = ref('first')
const responseData = ref<responseDataType>()
const requestData = ref<requestDataType>()
const assertionData = ref()
const extratedData = ref()
const title = ref('Null')
const status = ref('passed') // 假设状态是通过的

// 表格配置
const detailTableColumns: TableColumn[] = [
  { prop: 'type', label: '断言类型', slot: 'assertType' },
  { prop: 'enabled', label: '状态', width: 100, slot: 'StatusTag' },
  { prop: 'expected', label: '预期结果' },
  { prop: 'actual', label: '实际结果' },
]

// 打开抽屉并加载数据
const openDrawer = async (row: any) => {
  drawerVisible.value = true;
  loading.value = true;
  title.value = row.case_name
  status.value = row.status
  try {
    const data = await suiteApi.getCaseExecutionDetail(row.id);
    if (data) {
      responseData.value = data.response_data
      requestData.value = data.request_data
      assertionData.value = data.assertions_result
      extratedData.value = data.extracted_vars
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};


const responseBody = computed(() => {
  try {
    return JSON.parse(responseData.value?.body) || {}
  } catch (error) {
    return responseData.value?.body || {}
  }
})







// 暴露打开方法供父组件调用
defineExpose({
  openDrawer
});
</script>

<style scoped>
.case-detail-drawer {
  /* padding: 20px; */
  height: 100%;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 25px 0 15px;
  color: #606266;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.request-tabs {
  margin-top: 20px;
}

.empty-placeholder {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  margin-top: 10px;
}

.raw-body {
  display: flex;
  text-align: left;
  background: #f3f4f4;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

:deep(.el-descriptions) {
  margin-top: 10px;
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  margin-bottom: 15px;
}

:deep(.el-drawer__header) {
  background-color: #2f1b86;
  border-bottom: 1px solid #181717;
  margin-bottom: 0 0 12px;
  font-size: 18px;
  font-weight: bold;
  padding: 0 20px;
  color: #fff;
}

.customer-title {
  align-items: center;
}

</style>