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
      <el-collapse :expand-icon-position="'left'" accordion>
        <el-collapse-item
          v-for="(item, index) in popInfo || []"
          :key="item.id"
          :name="String(index)"
        >
          <template #title>
            <span :style="{ color: item.status === 'pass' ? 'green' : 'red' }">
              步骤{{ index+1 }}. {{ item.step.action }} 
            </span>
          </template>
          <div style="float: left; text-align: left;" class="request-detail">
            <span>日志: {{ item.log }}</span>
            <span v-if="item.error">异常: {{ item.error }}</span>
            <span v-if="item.screenshot">
              截图: 
              <a :href="baseFileUrl + item.screenshot " target="_blank">{{ baseFileUrl + item.screenshot }}</a>
            </span>
          </div>

        </el-collapse-item>
      </el-collapse>
    </div>
  </el-drawer>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { responseDataType, requestDataType } from '@/stores/testcase';
import { suiteApi } from '@/api';
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'

const baseFileUrl = ref(import.meta.env.VITE_FILE_BASE_URL)

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
const popInfo = ref([])

// 表格配置
const detailTableColumns: TableColumn[] = [
  { prop: 'type', label: '断言类型', slot: 'assertType' },
  { prop: 'enabled', label: '状态', width: 100, slot: 'StatusTag' },
  { prop: 'expected', label: '预期结果' },
  { prop: 'actual', label: '实际结果' },
]

// 打开抽屉并加载数据
const openDrawer = async (row: any) => {
  console.log(row)
  popInfo.value = row.steps_log
  drawerVisible.value = true;
  // loading.value = true;
  title.value = row.testcase_name
  status.value = row.status
  // try {
  //   const data = await suiteApi.getCaseExecutionDetail(row.id);
  //   if (data) {
  //     responseData.value = data.response_data
  //     requestData.value = data.request_data
  //     assertionData.value = data.assertions_result
  //     extratedData.value = data.extracted_vars
  //   }
  // } catch (error) {
  //   console.error(error);
  // } finally {
  //   loading.value = false;
  // }
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

.request-detail span {
  display: block; /* 将 span 设置为块级元素 */
  margin-bottom: 8px; /* 添加下方间距，避免内容过于紧凑 */
}

</style>