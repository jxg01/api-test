<template>
  <el-drawer 
    v-model="visible" 
    title="UI自动化测试报告" 
    size="100%"
    class="log-drawer-container"
  >
<div class="test-reort-container">
    <!-- 报告头部信息 -->
    <div class="report-header">
      <!-- <h1>UI自动化测试报告</h1> -->
      <div class="report-meta">
        <div class="meta-item">
          <span class="label">任务ID:</span>
          <span class="value">{{ log.id }}</span>
        </div>
        <div class="meta-item">
          <span class="label">执行时间:</span>
          <span class="value">{{ log.created_at }}</span>
        </div>
        <div class="meta-item">
          <span class="label">执行时长:</span>
          <span class="value">{{ log.duration }} 秒</span>
        </div>
        <div class="meta-item">
          <span class="label">执行人:</span>
          <span class="value">{{ log.executor }}</span>
        </div>
      </div>
    </div>

    <!-- 测试结果概览 -->
    <div class="summary-cards">
      <el-card class="summary-card total">
        <div class="card-content">
          <div class="number">{{ log.total }}</div>
          <div class="label">总用例数</div>
        </div>
      </el-card>
      
      <el-card class="summary-card passed">
        <div class="card-content">
          <div class="number">{{ log.passed }}</div>
          <div class="label">通过</div>
        </div>
      </el-card>
      
      <el-card class="summary-card failed">
        <div class="card-content">
          <div class="number">{{ log.failed }}</div>
          <div class="label">失败</div>
        </div>
      </el-card>
      
      <el-card class="summary-card error">
        <div class="card-content">
          <div class="number">{{ log.error }}</div>
          <div class="label">错误</div>
        </div>
      </el-card>
      
      <el-card class="summary-card success-rate">
        <div class="card-content">
          <div class="number">{{ log.success_rate }}%</div>
          <div class="label">通过率</div>
        </div>
      </el-card>
    </div>

    <!-- 测试用例结果列表 -->
    <div class="test-results">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>测试用例详情</span>
            <div>
              <el-button
                :type="filterStatus === 'passed' ? 'primary' : 'default'"
                @click="toggleFilter('passed')"
              >
                成功
              </el-button>
              <el-button
                :type="filterStatus === 'failed' ? 'danger' : 'default'"
                @click="toggleFilter('failed')"
              >
                失败
              </el-button>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索用例名称"
                :prefix-icon="Search"
                style="width: 250px; margin-left: 10px;"
              />
            </div>
          </div>
        </template>

        <el-table
          :data="filteredTestCases"
          style="width: 100%"
          row-class-name="test-case-row"
          @row-click="handleRowClick"
        >
          <el-table-column prop="testcase__name" label="用例名称" min-width="200" />
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="耗时(秒)" width="120">
            <template #default="scope">
              {{ scope.row.duration.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="executed_at" label="开始时间" width="260">
            <template #default="scope">
              <!-- {{ formatTime(scope.row.executed_at) }} -->
              {{ scope.row.executed_at }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                link
                type="primary"
                size="small"
                @click.stop="viewDetails(scope.row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 用例详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      width="90%"
      top="5vh"
      class="case-detail-dialog"
    >
      <div v-if="currentCase" class="case-detail">
        <!-- 用例基本信息 -->
        <div class="case-basic-info">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="用例名称">{{ currentCase.testcase__name }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentCase.status)">
                {{ getStatusText(currentCase.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行时长">{{ currentCase.duration.toFixed(2) }} 秒</el-descriptions-item>
            <el-descriptions-item label="执行时间">{{ currentCase.executed_at }}</el-descriptions-item>
            <!-- <el-descriptions-item label="结束时间">{{ formatTime(currentCase.end_time) }}</el-descriptions-item> -->
          </el-descriptions>
        </div>

        <!-- 执行日志展示 -->
        <div class="execution-log-section">
          <h3>执行日志</h3>
          <div class="log-viewer">
            <div class="log-toolbar">
              <el-button
                size="small"
                @click="copyLogs"
                icon="CopyDocument"
              >
                复制日志
              </el-button>
              <el-button
                size="small"
                @click="downloadLogs"
                icon="Download"
              >
                下载日志
              </el-button>
              <el-button
                size="small"
                @click="toggleWrap"
                :icon="wrapLines ? 'Close' : 'FullScreen'"
              >
                {{ wrapLines ? '取消换行' : '自动换行' }}
              </el-button>
              <el-input
                v-model="logSearch"
                placeholder="搜索日志内容"
                :prefix-icon="Search"
                size="small"
                style="width: 200px; margin-left: 10px;"
              />
            </div>
            <div
              class="log-content"
              :class="{ 'wrap-lines': wrapLines }"
              ref="logContent"
            >
              <div
                v-for="(line, index) in filteredLogLines"
                :key="index"
                class="log-line"
                :class="getLogLineClass(line)"
              >
                <!-- <span class="line-number">{{ index + 1 }}</span> -->
                <span class="line-content" v-html="highlightSearch(line)"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 失败截图 -->
        <div v-if="currentCase.screenshot" class="screenshot-section">
          <h3>失败截图</h3>
          <div class="screenshot-container">
            <el-image
              :src="baseFileUrl + currentCase.screenshot"
              :preview-src-list="[baseFileUrl + currentCase.screenshot]"
              fit="contain"
              style="max-height: 400px;"
            />
          </div>
        </div>
      </div>

      <!-- <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template> -->
    </el-dialog>
  </div>


  </el-drawer>


</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { ExecutionLog } from '@/stores/tasksStore';
import { Search } from '@element-plus/icons-vue';

const props = defineProps<{
  visible: boolean;
  log: ExecutionLog;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const visible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  }
});

interface TestCaseResult {
  id: number;
  testcase__name: string;
  status: 'passed' | 'failed' | 'running' | 'error';
  duration: number;
  executed_at: string;
  executed_by__username: string;
  steps_log: string;
  screenshot: string | null;
  browser_info: string;
}

const baseFileUrl = ref(import.meta.env.VITE_FILE_BASE_URL || '');
const logContent = ref<HTMLElement | null>(null);
const wrapLines = ref(false);
const logSearch = ref('');

const searchKeyword = ref('')
const detailDialogVisible = ref(false)
const currentCase = ref<TestCaseResult>()
const filterStatus = ref<string | null>(null);

function toggleFilter(status: string) {
  filterStatus.value = filterStatus.value === status ? null : status;
}

// 修改 filteredTestCases 计算属性
const filteredTestCases = computed(() => {
  let list = props.log.test_cases_result;
  if (filterStatus.value) {
    list = list.filter(caseItem => caseItem.status === filterStatus.value);
  }
  if (!searchKeyword.value) return list;
  const keyword = searchKeyword.value.toLowerCase();
  return list.filter(caseItem =>
    caseItem.testcase__name.toLowerCase().includes(keyword) ||
    caseItem.status.toLowerCase().includes(keyword)
  );
});

// 过滤日志行
const filteredLogLines = computed(() => {
  if (!currentCase.value) return []
  
  const logs = currentCase.value.steps_log.split('\n')
  if (!logSearch.value) return logs
  
  const keyword = logSearch.value.toLowerCase()
  return logs.filter(line => line.toLowerCase().includes(keyword))
})

// 查看用例详情
const viewDetails = (testCase: TestCaseResult) => {
  currentCase.value = testCase
  detailDialogVisible.value = true
  
  // 滚动到日志底部
  nextTick(() => {
    if (logContent.value) {
      logContent.value.scrollTop = logContent.value.scrollHeight
    }
  })
}

// 获取状态标签类型
const getStatusType = (status: 'passed' | 'failed' | 'running' | 'error') => {
  const statusMap = {
    'passed': 'success',
    'failed': 'danger',
    'error': 'warning',
    'running': 'info',
    // 'pending': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: 'passed' | 'failed' | 'running' | 'error') => {
  const statusMap = {
    'passed': '通过',
    'failed': '失败',
    'error': '错误',
    'running': '执行中',
    'pending': '待执行'
  }
  return statusMap[status] || status
}

// 获取日志行CSS类
const getLogLineClass = (line: string) => {
  if (line.includes('ERROR') || line.includes('错误') || line.includes('失败')) return 'log-error'
  if (line.includes('WARN') || line.includes('警告')) return 'log-warn'
  if (line.includes('INFO') || line.includes('信息')) return 'log-info'
  if (line.includes('DEBUG') || line.includes('调试')) return 'log-debug'
  return ''
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const highlightSearch = (line: string) => {
  const escaped = escapeHtml(line);
  if (!logSearch.value) return escaped;
  const regex = new RegExp(`(${logSearch.value})`, 'gi');
  return escaped.replace(regex, '<span style="background-color: yellow;font-weight: bold;padding: 0 2px;">$1</span>');
};

// 复制日志
const copyLogs = () => {
  if (!currentCase.value) return
  
  navigator.clipboard.writeText(currentCase.value.steps_log)
    .then(() => {
      ElMessage.success('日志已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败')
    })
}

// 下载日志
const downloadLogs = () => {
  if (!currentCase.value) return
  
  const blob = new Blob([currentCase.value.steps_log], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `log_${currentCase.value.testcase__name}_${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 切换换行模式
const toggleWrap = () => {
  wrapLines.value = !wrapLines.value
}

// 处理行点击事件
const handleRowClick = (row: TestCaseResult) => {
  viewDetails(row)
}
</script>

<style scoped>
.log-drawer-container :deep(.el-drawer__body) {
  padding: 0;
  color: #303133;
}

.test-report-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.report-header {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.report-header h1 {
  margin: 0 0 15px 0;
  color: #303133;
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item .label {
  font-weight: bold;
  margin-right: 8px;
  color: #606266;
}

.meta-item .value {
  color: #909399;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  text-align: center;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.summary-card.total {
  border-top: 4px solid #909399;
}

.summary-card.passed {
  border-top: 4px solid #67c23a;
}

.summary-card.failed {
  border-top: 4px solid #f56c6c;
}

.summary-card.error {
  border-top: 4px solid #e6a23c;
}

.summary-card.success-rate {
  border-top: 4px solid #409eff;
}

.card-content {
  padding: 20px;
}

.card-content .number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-content .label {
  font-size: 14px;
  color: #909399;
}

.test-results {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.test-case-row) {
  cursor: pointer;
}

:deep(.test-case-row:hover) {
  background-color: #f5f7fa;
}

.case-detail-dialog :deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}

.case-basic-info {
  margin-bottom: 20px;
}

.execution-log-section,
.screenshot-section {
  margin-bottom: 20px;
}

.execution-log-section h3,
.screenshot-section h3{
  margin-bottom: 10px;
  color: #303133;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.log-viewer {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.log-toolbar {
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
}

.log-content {
  height: 500px;
  overflow-y: auto;
  background-color: #fafafa;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.log-content.wrap-lines {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.log-line {
  display: flex;
  padding: 2px 10px;
  border-bottom: 1px solid #eee;
}

.log-line:hover {
  background-color: #f0f9eb;
}

.line-number {
  min-width: 40px;
  color: #909399;
  text-align: right;
  padding-right: 10px;
  user-select: none;
}

.line-content {
  flex: 1;
  text-align: left;
}

.log-error {
  color: #f56c6c;
  background-color: #fef0f0;
}

.log-warn {
  color: #e6a23c;
  background-color: #fdf6ec;
}

.log-info {
  color: #409eff;
}

.log-debug {
  color: #909399;
}

.screenshot-container {
  text-align: center;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
}

.error-content {
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
  overflow-x: auto;
}

.error-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #f56c6c;
}
</style>