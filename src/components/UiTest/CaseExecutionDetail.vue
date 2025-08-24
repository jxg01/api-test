<template>
  <el-drawer
    v-model="drawerVisible"
    direction="rtl"
    size="1200px"
    class="case-execution-drawer"
    @open="activeName = 'first'"
  >
    <template #header>
      <div class="drawer-header">
        <div class="status-indicator">
          <svg style="margin-right: 10px; width: 24px; height: 24px;">
            <circle cx="12" cy="12" r="10" :fill="status === 'passed' ? 'lightgreen' : 'red'" />
          </svg>
        </div>
        <h3>测试结果 - {{ title }}</h3>
      </div>
    </template>
    
    <div class="case-execution-content">
      <div v-if="currentCase" class="case-detail">
        <!-- 用例基本信息 -->
        <div class="case-basic-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用例名称">{{ currentCase.testcase_name }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentCase.status)">
                {{ getStatusText(currentCase.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行时长">{{ currentCase.duration.toFixed(2) }} 秒</el-descriptions-item>
            <el-descriptions-item label="执行时间">{{ currentCase.executed_at }}</el-descriptions-item>
            <el-descriptions-item label="浏览器信息">{{ currentCase.browser_info }}</el-descriptions-item>
            <el-descriptions-item label="执行人">{{ currentCase.executed_by }}</el-descriptions-item>
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
              :src="currentCase.screenshot"
              :preview-src-list="[currentCase.screenshot]"
              fit="contain"
              style="max-height: 400px;"
            />
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

// const baseFileUrl = ref(import.meta.env.VITE_FILE_BASE_URL || '');

interface ExecutionDetail {
  browser_info: string;
  duration: number;
  executed_at: string;
  executed_by: string;
  executed_by__username: string;
  screenshot?: string;
  status: string;
  steps_log: string;
  testcase_name: string;
}

const drawerVisible = ref(false);
const loading = ref(false);
const activeName = ref('first');
const title = ref('Null');
const status = ref('passed');
const currentCase = ref<ExecutionDetail>();

// 日志相关状态
const logContent = ref<HTMLElement | null>(null);
const wrapLines = ref(false);
const logSearch = ref('');

// 打开抽屉并加载数据
const openDrawer = async (row: any) => {
  loading.value = true;
  currentCase.value = row;
  drawerVisible.value = true;
  title.value = row.testcase_name;
  status.value = row.status;
  loading.value = false;
  
  // 滚动到日志底部
  nextTick(() => {
    if (logContent.value) {
      logContent.value.scrollTop = logContent.value.scrollHeight;
    }
  });
};

// 暴露打开方法供父组件调用
defineExpose({
  openDrawer
});

// 过滤日志行
const filteredLogLines = computed(() => {
  if (!currentCase.value?.steps_log) return [];
  
  const logs = currentCase.value.steps_log.split('\n');
  if (!logSearch.value) return logs;
  
  const keyword = logSearch.value.toLowerCase();
  return logs.filter(line => line.toLowerCase().includes(keyword));
});

// 获取状态标签类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'passed': 'success',
    'failed': 'danger',
    'error': 'warning',
    'running': 'info',
    'pending': 'info'
  };
  return statusMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'passed': '通过',
    'failed': '失败',
    'error': '错误',
    'running': '执行中',
    'pending': '待执行'
  };
  return statusMap[status] || status;
};

// 获取日志行CSS类
const getLogLineClass = (line: string) => {
  if (line.includes('ERROR') || line.includes('错误') || line.includes('执行失败')) return 'log-error';
  if (line.includes('WARN') || line.includes('警告')) return 'log-warn';
  if (line.includes('INFO') || line.includes('信息')) return 'log-info';
  if (line.includes('DEBUG') || line.includes('调试')) return 'log-debug';
  return '';
};

// HTML转义函数
function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 高亮搜索关键词
const highlightSearch = (line: string) => {
  const escaped = escapeHtml(line);
  if (!logSearch.value) return escaped;
  const regex = new RegExp(`(${logSearch.value})`, 'gi');
  return escaped.replace(regex, '<span style="background-color: yellow;font-weight: bold;padding: 0 2px;">$1</span>');
};

// 复制日志
const copyLogs = () => {
  if (!currentCase.value?.steps_log) return;
  
  navigator.clipboard.writeText(currentCase.value.steps_log)
    .then(() => {
      ElMessage.success('日志已复制到剪贴板');
    })
    .catch(err => {
      console.error('复制失败:', err);
      ElMessage.error('复制失败');
    });
};

// 下载日志
const downloadLogs = () => {
  if (!currentCase.value?.steps_log) return;
  
  const blob = new Blob([currentCase.value.steps_log], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `log_${currentCase.value.testcase_name}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 切换换行模式
const toggleWrap = () => {
  wrapLines.value = !wrapLines.value;
};
</script>

<style scoped>
.case-execution-drawer :deep(.el-drawer__header) {
  background-color: #2f1b86;
  border-bottom: 1px solid #181717;
  margin-bottom: 0;
  /* font-size: 18px; */
  font-weight: bold;
  /* padding: 16px 20px; */
  /* color: #fff; */
}

.drawer-header {
  display: flex;
  align-items: center;
}

.status-indicator {
  margin-right: 10px;
}

.case-execution-content {
  padding: 20px;
  height: 100%;
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
.screenshot-section h3 {
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
  height: 400px;
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
  color: #333;
}

.log-line:hover {
  background-color: #f0f9eb;
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

.highlight {
  background-color: yellow;
  font-weight: bold;
  padding: 0 2px;
}

.screenshot-container {
  text-align: center;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
}
</style>