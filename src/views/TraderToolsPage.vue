<template>

  
  <div class="test-report-container">
    <!-- 报告头部信息 -->
    <div class="report-header">
      <h1>UI自动化测试报告</h1>
      <div class="report-meta">
        <div class="meta-item">
          <span class="label">任务ID:</span>
          <span class="value">{{ report.task_id }}</span>
        </div>
        <div class="meta-item">
          <span class="label">执行时间:</span>
          <span class="value">{{ formatDate(report.start_time) }}</span>
        </div>
        <div class="meta-item">
          <span class="label">执行时长:</span>
          <span class="value">{{ report.duration }} 秒</span>
        </div>
        <div class="meta-item">
          <span class="label">执行人:</span>
          <span class="value">{{ report.executor }}</span>
        </div>
      </div>
    </div>

    <!-- 测试结果概览 -->
    <div class="summary-cards">
      <el-card class="summary-card total">
        <div class="card-content">
          <div class="number">{{ report.total_cases }}</div>
          <div class="label">总用例数</div>
        </div>
      </el-card>
      
      <el-card class="summary-card passed">
        <div class="card-content">
          <div class="number">{{ report.passed }}</div>
          <div class="label">通过</div>
        </div>
      </el-card>
      
      <el-card class="summary-card failed">
        <div class="card-content">
          <div class="number">{{ report.failed }}</div>
          <div class="label">失败</div>
        </div>
      </el-card>
      
      <el-card class="summary-card error">
        <div class="card-content">
          <div class="number">{{ report.error }}</div>
          <div class="label">错误</div>
        </div>
      </el-card>
      
      <el-card class="summary-card success-rate">
        <div class="card-content">
          <div class="number">{{ report.success_rate }}%</div>
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
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用例名称或状态"
              prefix-icon="el-icon-search"
              style="width: 250px;"
            />
          </div>
        </template>

        <el-table
          :data="filteredTestCases"
          style="width: 100%"
          row-class-name="test-case-row"
          @row-click="handleRowClick"
        >
          <el-table-column prop="case_name" label="用例名称" min-width="200" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="耗时(秒)" width="100">
            <template #default="scope">
              {{ scope.row.duration.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="start_time" label="开始时间" width="160">
            <template #default="scope">
              {{ formatTime(scope.row.start_time) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                type="text"
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
      :title="currentCase?.case_name"
      width="90%"
      top="5vh"
      class="case-detail-dialog"
    >
      <div v-if="currentCase" class="case-detail">
        <!-- 用例基本信息 -->
        <div class="case-basic-info">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="用例名称">{{ currentCase.case_name }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentCase.status)">
                {{ getStatusText(currentCase.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行时长">{{ currentCase.duration.toFixed(2) }} 秒</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatTime(currentCase.start_time) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatTime(currentCase.end_time) }}</el-descriptions-item>
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
                icon="el-icon-document-copy"
              >
                复制日志
              </el-button>
              <el-button
                size="small"
                @click="downloadLogs"
                icon="el-icon-download"
              >
                下载日志
              </el-button>
              <el-button
                size="small"
                @click="toggleWrap"
                :icon="wrapLines ? 'el-icon-close' : 'el-icon-full-screen'"
              >
                {{ wrapLines ? '取消换行' : '自动换行' }}
              </el-button>
              <el-input
                v-model="logSearch"
                placeholder="搜索日志内容"
                prefix-icon="el-icon-search"
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

        <!-- 错误堆栈 -->
        <div v-if="currentCase.error_traceback" class="error-section">
          <h3>错误堆栈</h3>
          <div class="error-content">
            <pre>{{ currentCase.error_traceback }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
// import { getTestReport } from '@/api/report'

export default {
  name: 'UITestReport',
  setup() {
    const route = useRoute()
    const taskId = route.params.taskId
    const report = ref({
      task_id: '',
      start_time: '',
      duration: 0,
      executor: '',
      total_cases: 0,
      passed: 0,
      failed: 0,
      error: 0,
      success_rate: 0,
      test_cases: []
    })

    const baseFileUrl = ref(import.meta.env.VITE_FILE_BASE_URL)
    
    const searchKeyword = ref('')
    const detailDialogVisible = ref(false)
    const currentCase = ref(null)
    const logContent = ref(null)
    const wrapLines = ref(false)
    const logSearch = ref('')
    
    // 过滤测试用例
    const filteredTestCases = computed(() => {
      if (!searchKeyword.value) return report.value.test_cases
      
      const keyword = searchKeyword.value.toLowerCase()
      return report.value.test_cases.filter(caseItem => 
        caseItem.name.toLowerCase().includes(keyword) || 
        caseItem.status.toLowerCase().includes(keyword)
      )
    })
    
    // 过滤日志行
    const filteredLogLines = computed(() => {
      if (!currentCase.value) return []
      
      const logs = currentCase.value.log.split('\n')
      if (!logSearch.value) return logs
      
      const keyword = logSearch.value.toLowerCase()
      return logs.filter(line => line.toLowerCase().includes(keyword))
    })
    
    // 加载报告数据
    const loadReport = async () => {
      try {
        // const response = await getTestReport(taskId)
        // report.value = response.data

        report.value = {
  "task_id": "ui_task_20231015143025",
  "name": "每日UI回归测试",
  "start_time": "2023-10-15T14:30:25Z",
  "end_time": "2023-10-15T14:35:42Z",
  "duration": 317.24,
  "executor": "admin",
  "total_cases": 3,
  "passed": 1,
  "failed": 1,
  "error": 1,
  "success_rate": 33.33,
  "test_cases": [
    {
      "id": 101,
      "case_name": "用户登录功能测试",
      "status": "passed",
      "start_time": "2023-10-15T14:30:30Z",
      "end_time": "2023-10-15T14:31:15Z",
      "duration": 45.23,
      "log": "[2025-08-21 22:53:00] 开始执行前置条件\n[2025-08-21 22:53:00] 前置条件执行完成\n[2025-08-21 22:53:00] 启动浏览器\n[2025-08-21 22:53:00] 浏览器环境初始化完成\n[2025-08-21 22:53:00] 开始执行测试步骤\n[2025-08-21 22:53:00] 执行步骤 1: goto\n[2025-08-21 22:53:00] 导航到: http://www.baidu.com\n[2025-08-21 22:53:02] 执行步骤 2: input\n[2025-08-21 22:53:02] 在元素 id=chat-textarea 中输入: python使用\n[2025-08-21 22:53:03] 执行步骤 3: click\n[2025-08-21 22:53:03] 点击元素: id=chat-submit-button\n[2025-08-21 22:53:03] 执行步骤 4: sleep\n[2025-08-21 22:53:03] 等待 2.0 秒\n[2025-08-21 22:53:05] 执行步骤 5: assert\n[2025-08-21 22:53:05] 执行断言: title, 选择器: , 期望: python使用\n[2025-08-21 22:53:05] 测试步骤执行完成\n[2025-08-21 22:53:05] 浏览器已关闭\n[2025-08-21 22:53:05] 开始执行后置步骤\n[2025-08-21 22:53:05] 执行后置SQL步骤\n[2025-08-21 22:53:05] 执行SQL: select * from qy_user;\n[2025-08-21 22:53:05] 数据库配置: easy_api@127.0.0.1:3306\n[2025-08-21 22:53:05] SQL执行结果: [{'id': 1, 'password': 'pbkdf2_sha256$600000$ddsRIrIvd5ZF85zM2l40C0$MXMJF50v5bjdqAeGPQ1p+ZG2C8CUwn7i...\n[2025-08-21 22:53:05] 后置步骤执行完成\n[2025-08-21 22:53:05] 测试用例执行完成，状态: passed, 耗时: 5.06秒\n",
      "screenshot": null,
      "error_traceback": ""
    },
    {
      "id": 102,
      "case_name": "商品搜索功能测试",
      "status": "failed",
      "start_time": "2023-10-15T14:31:20Z",
      "end_time": "2023-10-15T14:32:05Z",
      "duration": 45.78,
      "log": "[2025-08-21 23:50:05] 开始执行前置条件\n[2025-08-21 23:50:05] 前置条件执行完成\n[2025-08-21 23:50:05] 启动浏览器\n[2025-08-21 23:50:05] 浏览器环境初始化完成\n[2025-08-21 23:50:05] 开始执行测试步骤\n[2025-08-21 23:50:05] 执行步骤 1: goto\n[2025-08-21 23:50:05] 导航到: https://zhuanlan.zhihu.com/\n[2025-08-21 23:50:22] 执行步骤 2: click\n[2025-08-21 23:50:22] 点击元素: xpath=//*[text()=\"login\"]\n[2025-08-21 23:50:32] 步骤 2 执行失败: Page.wait_for_selector: Timeout 10000ms exceeded.\nCall log:\n  - waiting for locator(\"//*[text()=\\\"login\\\"]\") to be visible\n\n[2025-08-21 23:50:32] 已保存失败截图: screenshots/step_2_fail_click_1755791432.png\n[2025-08-21 23:50:32] 步骤 2 执行失败，停止后续步骤执行\n[2025-08-21 23:50:32] 测试步骤执行完成\n[2025-08-21 23:50:32] 浏览器已关闭\n[2025-08-21 23:50:32] 开始执行后置步骤\n[2025-08-21 23:50:32] 执行后置SQL步骤\n[2025-08-21 23:50:32] 执行SQL: select id from qy_user;\n[2025-08-21 23:50:32] 数据库配置: easy_api@127.0.0.1:3306\n[2025-08-21 23:50:32] SQL执行结果: [{'id': 2}, {'id': 1}, {'id': 3}]\n[2025-08-21 23:50:32] 后置步骤执行完成\n[2025-08-21 23:50:32] 测试用例执行完成，状态: failed, 耗时: 27.26秒\n",
      "screenshot": "screenshots/step_2_fail_click_1755789562.png",
      "error_traceback": "AssertionError: 元素 .product-list 的文本不包含 'iPhone 15'，实际为: '暂无相关商品'\n  at _execute_assert_step (execution_engine.py:245)\n  at execute_steps (execution_engine.py:180)\n  at execute_test_case (execution_engine.py:310)"
    },
    {
      "id": 103,
      "case_name": "购物车添加商品测试",
      "status": "error",
      "start_time": "2023-10-15T14:32:10Z",
      "end_time": "2023-10-15T14:32:55Z",
      "duration": 45.23,
      "log": "[2025-08-21 23:19:04] 开始执行前置条件\n[2025-08-21 23:19:04] 前置条件执行完成\n[2025-08-21 23:19:05] 启动浏览器\n[2025-08-21 23:19:05] 浏览器环境初始化完成\n[2025-08-21 23:19:05] 开始执行测试步骤\n[2025-08-21 23:19:05] 执行步骤 1: goto\n[2025-08-21 23:19:05] 导航到: https://zhuanlan.zhihu.com/\n[2025-08-21 23:19:12] 执行步骤 2: click\n[2025-08-21 23:19:12] 点击元素: xpath=//*[text()=\"login\"]\n[2025-08-21 23:19:22] 步骤 2 执行失败: Page.wait_for_selector: Timeout 10000ms exceeded.\nCall log:\n  - waiting for locator(\"//*[text()=\\\"login\\\"]\") to be visible\n\n[2025-08-21 23:19:22] 错误堆栈: Traceback (most recent call last):\n  File \"/Users/jiangxiugang/projects/qy-backend/common/handle_ui_test/ui_runner.py\", line 257, in execute_step\n    await page.wait_for_selector(selector, state='visible', timeout=10000)\n  File \"/Users/jiangxiugang/projects/qy-backend/new_env/lib/python3.9/site-packages/playwright/async_api/_generated.py\", line 8180, in wait_for_selector\n    await self._impl_obj.wait_for_selector(\n  File \"/Users/jiangxiugang/projects/qy-backend/new_env/lib/python3.9/site-packages/playwright/_impl/_page.py\", line 425, in wait_for_selector\n    return await self._main_frame.wait_for_selector(**locals_to_params(locals()))\n  File \"/Users/jiangxiugang/projects/qy-backend/new_env/lib/python3.9/site-packages/playwright/_impl/_frame.py\", line 323, in wait_for_selector\n    await self._channel.send(\"waitForSelector\", locals_to_params(locals\"))\n  File \"/Users/jiangxiugang/projects/qy-backend/new_env/lib/python3.9/site-packages/playwright/_impl/_connection.py\", line 61, in send\n    return await self._connection.wrap_api_call(\n  File \"/Users/jiangxiugang/projects/qy-backend/new_env/lib/python3.9/site-packages/playwright/_impl/_connection.py\", line 528, in wrap_api_call\n    raise rewrite_error(error, f\"{parsed_st['apiName']}: {error}\") from None\nplaywright._impl._errors.TimeoutError: Page.wait_for_selector: Timeout 10000ms exceeded.\nCall log:\n  - waiting for locator(\"//*[text()=\\\"login\\\"]\") to be visible\n\n\n[2025-08-21 23:19:22] 已保存失败截图: screenshots/step_2_fail_click_1755789562.png\n[2025-08-21 23:19:22] 步骤 2 执行失败，停止后续步骤执行\n[2025-08-21 23:19:22] 测试步骤执行完成\n[2025-08-21 23:19:22] 浏览器已关闭\n[2025-08-21 23:19:22] 开始执行后置步骤\n[2025-08-21 23:19:22] 执行后置SQL步骤\n[2025-08-21 23:19:22] 执行SQL: select id from qy_user;\n[2025-08-21 23:19:22] 数据库配置: easy_api@127.0.0.1:3306\n[2025-08-21 23:19:22] SQL执行结果: [{'id': 2}, {'id': 1}, {'id': 3}]\n[2025-08-21 23:19:22] 后置步骤执行完成\n[2025-08-21 23:19:22] 测试用例执行完成，状态: failed, 耗时: 17.93秒\n",
      "screenshot": "/media/test_screenshots/error_103_1697373136.png",
      "error_traceback": "TimeoutError: Timeout 3000ms exceeded.\n  at _execute_wait_step (execution_engine.py:220)\n  at execute_steps (execution_engine.py:158)\n  at execute_test_case (execution_engine.py:315)"
    }
  ]
}



















      } catch (error) {
        ElMessage.error('加载测试报告失败')
        console.error('加载测试报告失败:', error)
      }
    }
    
    // 查看用例详情
    const viewDetails = (testCase) => {
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
    const getStatusType = (status) => {
      const statusMap = {
        'passed': 'success',
        'failed': 'danger',
        'error': 'warning',
        'running': 'info',
        'pending': 'info'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'passed': '通过',
        'failed': '失败',
        'error': '错误',
        'running': '执行中',
        'pending': '待执行'
      }
      return statusMap[status] || status
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }
    
    // 格式化时间
    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString()
    }
    
    // 获取日志行CSS类
    const getLogLineClass = (line) => {
      if (line.includes('ERROR') || line.includes('错误') || line.includes('执行失败')) return 'log-error'
      if (line.includes('WARN') || line.includes('警告')) return 'log-warn'
      if (line.includes('INFO') || line.includes('信息')) return 'log-info'
      if (line.includes('DEBUG') || line.includes('调试')) return 'log-debug'
      return ''
    }
    
    // 高亮搜索关键词
    const highlightSearch = (line) => {
      if (!logSearch.value) return line
      
      const regex = new RegExp(`(${logSearch.value})`, 'gi')
      return line.replace(regex, '<span class="highlight">$1</span>')
    }
    
    // 复制日志
    const copyLogs = () => {
      if (!currentCase.value) return
      
      navigator.clipboard.writeText(currentCase.value.log)
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
      
      const blob = new Blob([currentCase.value.log], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `log_${currentCase.value.name}_${Date.now()}.txt`
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
    const handleRowClick = (row) => {
      viewDetails(row)
    }
    
    onMounted(() => {
      loadReport()
    })
    
    return {
      report,
      searchKeyword,
      filteredTestCases,
      detailDialogVisible,
      currentCase,
      logContent,
      wrapLines,
      logSearch,
      filteredLogLines,
      viewDetails,
      getStatusType,
      getStatusText,
      formatDate,
      formatTime,
      getLogLineClass,
      highlightSearch,
      copyLogs,
      downloadLogs,
      toggleWrap,
      handleRowClick,
      baseFileUrl
    }
  }
}
</script>

<style scoped>
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
.screenshot-section,
.error-section {
  margin-bottom: 20px;
}

.execution-log-section h3,
.screenshot-section h3,
.error-section h3 {
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
  height: 300px;
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