<template>
  <!-- 在其他页面调用这个组件 -->
  <div class="customer-header">
  <el-drawer
    v-model="drawerVisible"
    direction="rtl"
    size="700"
  >
    <template #header>
      <div class="customer-title" style="display: flex;">
        <h4>用例详情</h4>
      </div>
      
    </template>
    <div class="case-detail-drawer" v-loading="loading">
      <!-- 基础信息 -->
      <el-descriptions title="基础信息" border :column="1">
        <el-descriptions-item label="关联接口" v-if="caseDetail.interface">
          <div style="display: flex; gap: 12px;">
            <el-tag type="success">{{ caseDetail.interface_method }}</el-tag>
            <span>{{ caseDetail.interface_path }}</span>
          </div>
        </el-descriptions-item>
        <!-- <el-descriptions-item label="用例ID">{{ caseDetail.id }}</el-descriptions-item> -->
        <el-descriptions-item label="用例名称">{{ caseDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="caseDetail.enabled ? 'success' : 'danger'">
            {{ caseDetail.enabled ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ caseDetail.description }}</el-descriptions-item>
        
      </el-descriptions>

      <!-- 请求信息 -->
      <el-tabs class="request-tabs">
        <!-- 请求头 -->
        <el-tab-pane label="请求头">
          <el-descriptions border :column="1" v-if="Object.keys(caseDetail.headers || {}).length">
            <el-descriptions-item 
              v-for="(value, key) in caseDetail.headers" 
              :key="key" 
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
          <div v-else class="empty-placeholder">无请求头配置</div>
        </el-tab-pane>

        <!-- 参数 -->
        <el-tab-pane label="参数">
          <el-descriptions border :column="1" v-if="Object.keys(caseDetail.params || {}).length">
            <el-descriptions-item 
              v-for="(value, key) in caseDetail.params" 
              :key="key" 
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
          <div v-else class="empty-placeholder">无参数配置</div>
        </el-tab-pane>

        <!-- 请求体 -->
        <el-tab-pane :label="`请求体 (${caseDetail.body_type})`">
          <div v-if="caseDetail.body_type === 'form'">
            <el-descriptions border :column="1" v-if="Object.keys(caseDetail.data || {}).length">
              <el-descriptions-item 
                v-for="(value, key) in caseDetail.data" 
                :key="key" 
                :label="key"
              >
                {{ value }}
                
              </el-descriptions-item>
            </el-descriptions>
            <div v-else class="empty-placeholder">无表单数据</div>
          </div>
          
          <div v-else-if="caseDetail.body_type === 'raw'">
            <pre class="raw-body">{{ JSON.parse(caseDetail.body) }}</pre>
            <!-- <pre class="raw-body">{{ caseDetail.body }}</pre> -->
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 断言信息 -->
      <div class="section-title">断言规则</div>
      <el-table :data="caseDetail.assertions" border v-if="caseDetail.assertions?.length">
        <el-table-column prop="type" label="断言类型">
          <template #default="scope">
            {{ getAssertionTypeLabel(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径/表达式" v-if="caseDetail.assertions.some(item => item.path)"></el-table-column>
        <el-table-column prop="expected" label="期望值"></el-table-column>
      </el-table>
      <div v-else class="empty-placeholder">无断言配置</div>

      <!-- 参数提取 -->
      <div class="section-title">参数提取</div>
      <el-table :data="caseDetail.variable_extract" border v-if="caseDetail.variable_extract?.length">
        <el-table-column prop="type" label="提取类型">
          <template #default="scope">
            {{ getExtractTypeLabel(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="变量名"></el-table-column>
        <el-table-column prop="path" label="路径/表达式"></el-table-column>
      </el-table>
      <div v-else class="empty-placeholder">无参数提取配置</div>
    </div>
  </el-drawer>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useCaseStore } from '@/stores/testcase';

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

const drawerVisible = ref(false);
const loading = ref(false);
const caseDetail = ref<any>({});

// 打开抽屉并加载数据
const openDrawer = async (tid: number) => {
  drawerVisible.value = true;
  loading.value = true;
  
  try {
    // 调用store方法获取用例详情
    const caseStore = useCaseStore();
    const data = await caseStore.getTestCaseDetail(tid);
    caseDetail.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 获取断言类型标签
const getAssertionTypeLabel = (type: string) => {
  const typeObj = assertionTypes.find(t => t.value === type);
  return typeObj ? typeObj.label : type;
};

// 获取参数提取类型标签
const getExtractTypeLabel = (type: string) => {
  const typeObj = extractTypes.find(t => t.value === type);
  return typeObj ? typeObj.label : type;
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
  background-color: #e6ecf4;
  border-bottom: 1px solid #cc0909;
  margin-bottom: 0 0 12px;
  font-size: 18px;
  font-weight: bold;
}

/* .customer-title {
  font-size: 18px;
  font-weight: bold;
  flex-grow: 1;
  border-bottom: 1px solid #6cdc27;
} */

/* pre {
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  color: #333;
} */
</style>