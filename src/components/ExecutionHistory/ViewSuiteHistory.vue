<template>
  <!-- 在其他页面调用这个组件 -->
  <div class="customer-header">
  <el-drawer
    v-model="drawerVisible"
    direction="rtl"
    size="900"
  >
    <template #header>
      <div class="customer-title" style="display: flex; text-align: center;">
        <svg style="margin-right: 10px; width: 24px; height: 24px;">
          <circle cx="12" cy="12" r="10 " :fill="status==='passed'?'lightgreen':'red'" />
        </svg>
        <h4>测试结果 - {{ title || 123 }}</h4>
      </div>
    </template>
      <div class="summary-section">
      <div class="chart-and-stats">
        <BasePieChart :failed="suitInfo?.total_cases - suitInfo?.passed_cases" :passed="suitInfo?.passed_cases || 0"  />
        <div class="stats">
          <!-- <div>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" fill="#00FF00"/>
            </svg>
            总数: {{ suitInfo?.total_cases }}</div> -->
          <div>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" fill="#00FF00"/>
            </svg>
            通过: {{ suitInfo?.passed_cases }}</div>
          <div>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" fill="#FF0000"/>
            </svg>
            失败: {{ failed }}</div>
          <div>总耗时: {{ suitInfo?.duration }} 秒</div>
          <div>平均请求耗时: {{ roundTo(suitInfo?.duration / suitInfo?.total_cases, 2) }} 秒</div>
        </div>
      </div>
    </div>

    <el-divider />
    <div class="filter-tabs">
      <el-radio-group v-model="statusFilter" fill="#6cf">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="passed">成功</el-radio-button>
        <el-radio-button value="failed">失败</el-radio-button>
      </el-radio-group>
    </div>
    <el-collapse :expand-icon-position="'left'" accordion>
      <el-collapse-item
        v-for="(item, index) in filteredCases || []"
        :key="item.id"
        :name="String(index)"
      >
        <template #title>
          <span :style="{ color: item.status === 'passed' ? 'green' : 'red' }">
            步骤{{ index+1 }}. {{ item.interface_method }} {{ item.interface_path }}  ({{ item.case_name }})
          </span>
        </template>
        <div class="request-detail">
        <el-tabs v-model="activeName" class="demo-tabs" type="border-card">
          <el-tab-pane label="请求信息" name="first">
            <el-skeleton :loading="loading" animated>
              <template #default>
                <div v-if="item.request_data">
                  <el-descriptions border :column="1">
                    <!-- 状态码 -->
                    <el-descriptions-item label="请求地址"  width="100">
                      <span> {{ item.request_data.url }} </span>
                    </el-descriptions-item>
                    <!-- 状态码 -->
                    <el-descriptions-item label="请求方式">
                      <el-tag>
                        {{ item.request_data.method }}
                      </el-tag>
                    </el-descriptions-item>

                    <!-- 响应头 -->
                    <el-descriptions-item label="请求头">
                      <key-value-viewer :data="item.request_data.headers" />
                    </el-descriptions-item>

                    <!-- 查询参数 -->
                    <el-descriptions-item label="查询参数">
                      <key-value-viewer :data="item.request_data.params" />
                    </el-descriptions-item>

                    <!-- 响应体 -->
                    <el-descriptions-item label="请求参数">
                      <key-value-viewer :data="item.request_data.data" />
                    </el-descriptions-item>

                    <!-- 响应体 -->
                    <el-descriptions-item label="请求体">
                      <!-- <key-value-viewer :data="item.request_data.json" /> -->
                      <pre class="raw-body">{{ item.request_data.json }}</pre>
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
                <div v-if="item.response_data">
                  <el-descriptions border :column="1" class="response-info">
                    <!-- 状态码 -->
                    <el-descriptions-item label="状态码" width="100">
                      <el-tag>
                        {{ item.response_data.status_code }}
                      </el-tag>
                    </el-descriptions-item>

                    <!-- 响应头 -->
                    <el-descriptions-item label="响应头">
                      <key-value-viewer :data="item.response_data.headers" :width="300"/>
                    </el-descriptions-item>

                    <!-- 响应体 -->
                    <el-descriptions-item label="响应体">
                        <pre class="raw-body">{{ item.response_data.body }}</pre>
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
                <div v-if="item.assertions_result">
                  <BaseTable
                    :columns="detailTableColumns"
                    :table-data="item.assertions_result"
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
                <div v-if="item.extracted_vars">
                  <key-value-viewer :data="item.extracted_vars" :width="300" :key-label="'变量名称'" :value-label="'提取值'" />
                </div>
              </template>
            </el-skeleton>
          </el-tab-pane>
        </el-tabs>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-drawer>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { responseDataType, requestDataType } from '@/stores/testcase';
import { suiteApi } from '@/api';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePieChart from '@/components/base/BasePieChart.vue';


interface suiteExecutionDetail {
  id: number;
  suite: string;
  status: 'passed' | 'failed' | 'pending';
  started_at: Date | null;
  ended_at: Date | null;
  duration: number;
  executed_by: string;
  cases: {
    id: number;
    case: string;
    status: 'passed' | 'failed' | 'pending';
    duration: number;
    request_data: requestDataType;
    response_data: responseDataType;
    assertions_result: [],
    extracted_vars: {
      [key: string]: any;
    };
    created_at: Date;
    executed_by: string;
    interface_method: string;
    interface_path: string;
    case_name: string;
  }[];
  pass_rate: number;
  total_cases: number;
  passed_cases: number;
}

const drawerVisible = ref(false);
const loading = ref(false);
const suitInfo = ref<suiteExecutionDetail>();

const failed = computed(() => {
  if (!suitInfo.value) return 0;
  return suitInfo.value.total_cases - suitInfo.value.passed_cases || 0;
});

const statusFilter = ref('all')
const filteredCases = computed(() => {
  if (statusFilter.value === 'all') return suitInfo.value?.cases || []
  return suitInfo.value?.cases.filter(item => item.status === statusFilter.value)
})

function roundTo(num: number, decimalPlaces: number) {
  const factor = 10 ** decimalPlaces;
  return Math.round(num * factor) / factor;
}


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

const activeName = ref('first')
const title = ref('Null')
const status = ref('passed') // 假设状态是通过的


// 表格配置
const detailTableColumns: TableColumn[] = [
  { prop: 'type', label: '断言类型', slot: 'assertType' },
  { prop: 'enabled', label: '状态', width: 100, slot: 'StatusTag' },
  { prop: 'expected', label: '预期结果' },
  { prop: 'actual', label: '实际结果' },
]


const rData = ref()



// 打开抽屉并加载数据
const openDrawer = async (row: any) => {
  drawerVisible.value = true;
  loading.value = true;
  title.value = row.name || row.suite || 'Null'
  console.log('row:', row)
  status.value = row.status
  try {
    const data = await suiteApi.getSuiteExecutionDetail(row.id);
    if (data) {
      console.log('Suite Execution Detail:', data);
      suitInfo.value = data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};



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








.summary-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.chart-and-stats {
  display: flex;
  align-items: center;
  width: 600px;
}
.stats {
  margin-left: 40px;
  text-align: left;
  color: black
}
.center-text {
  text-align: center;
  font-size: 16px;
}
.filter-tabs {
  align-self: center;
  display: flex;
  padding: 0 0 20px 0;
}

</style>