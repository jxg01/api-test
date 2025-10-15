<template>
  <div class="trading-tool-container">
    <el-card class="main-card shadow-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">交易工具 V2.0</h2>
          <div class="header-actions">
            <el-upload
              class="upload-btn"
              :show-file-list="false"
              accept=".json"
              :before-upload="handleFileUpload"
            >
              <el-button type="primary" size="small" :icon="DocumentCopy" :title="'打开配置文件'">
                打开文件
              </el-button>
            </el-upload>
            <el-button type="success" size="small" :icon="Document" :title="'保存当前配置'" @click="saveBasicInfo">
                保存基本信息
              </el-button>
          </div>
        </div>
      </template>

      <!-- 基本信息组 -->
      <el-form :model="formData" label-width="100px" class="form-container">
        <!-- 链接信息区域 -->
        <div class="form-section">
          <h3 class="section-title">链接信息</h3>
          <el-row :gutter="20">
            <!-- IP和端口 -->
            <el-col :xs="24" :sm="24" :md="24" :lg="12">
              <el-form-item label="IP:" prop="ip">
                <el-input v-model="formData.ip" placeholder="请输入IP地址" class="form-input"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12">
              <el-form-item label="端口:" prop="port">
                <el-input v-model="formData.port" placeholder="请输入端口" class="form-input">
                  <template #append>
                    <el-button type="primary" @click="testConnect" size="small">测试连接</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <el-form-item label="服务器类型:" prop="serverType">
                <el-select v-model="formData.serverType" placeholder="请选择服务器类型" class="form-input">
                  <el-option label="MT4" value="MT4"></el-option>
                  <el-option label="MT5" value="MT5"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <el-form-item label="服务器名称:" prop="serverName">
                <el-input v-model="formData.serverName" placeholder="请输入服务器名称" class="form-input"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <el-form-item label="交易账号:" prop="ta">
                <el-input v-model="formData.ta" placeholder="请输入交易账号" class="form-input"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <el-form-item label="功能:" prop="function">
                <el-radio-group v-model="formData.function" :disabled="formData.serverType === 'MT5'" class="radio-group">
                  <el-radio-button label="1" value="1">仅开单</el-radio-button>
                  <el-radio-button label="2" value="2">开单+关单</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 交易信息区域 -->
        <div class="form-section">
          <h3 class="section-title">交易信息</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="8">
              <el-form-item label="订单类型:" prop="cmd">
                <el-select v-model="formData.cmd" placeholder="请选择订单类型" class="form-input">
                  <el-option label="买入" value="buy"></el-option>
                  <el-option label="卖出" value="sell"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="8">
              <el-form-item label="交易手数:" prop="volume">
                <el-input v-model.number="formData.volume" type="number" placeholder="请输入交易手数" class="form-input" step="0.01" :min="0.01" @input="handleVolumeInput"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="8">
              <el-form-item label="交易产品:" prop="symbol">
                <el-select v-model="formData.symbol" placeholder="请选择交易产品" class="form-input">
                  <el-option v-for="symbol in defaultSymbols" :key="symbol" :label="symbol" :value="symbol"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="8">
              <el-form-item label="价格:" prop="price">
                <el-input v-model.number="formData.price" type="number" placeholder="请输入价格" class="form-input"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="8">
              <el-form-item label="下单次数:" prop="openNum">
                <el-input v-model.number="formData.openNum" type="number" placeholder="请输入下单次数" class="form-input"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="8">
              <el-form-item label="线程数量:" prop="threadNum">
                <el-select v-model.number="formData.threadNum" placeholder="请选择线程数量" class="form-input">
                  <el-option label="1" :value="1"></el-option>
                  <el-option label="3" :value="3"></el-option>
                  <el-option label="5" :value="5"></el-option>
                  <el-option label="7" :value="7"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="24">
              <el-form-item label="备注:" prop="comment">
                <el-input v-model="formData.comment" placeholder="请输入备注" class="form-input"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 操作按钮区域 -->
        <div class="action-buttons">
          <el-button 
            type="primary" 
            :disabled="isRunning" 
            @click="submit" 
            size="large"
            :icon="ArrowRight"
            :class="{ 'btn-disabled': isRunning }"
          >
            提交任务
          </el-button>
          <el-button 
            type="danger" 
            :disabled="!isRunning" 
            @click="stopThreads" 
            size="large"
            :icon="Stopwatch"
            :class="{ 'btn-disabled': !isRunning }"
          >
            中断任务
          </el-button>
          <el-button 
            @click="clearLog" 
            size="large"
            :icon="Delete"
          >
            清除日志
          </el-button>
          <div v-if="isRunning" class="status-indicator">
            <el-tag type="success" effect="dark" class="status-tag">
              <Loading />
              正在运行中
            </el-tag>
            <span class="run-id">Run ID: {{ currentRunId }}</span>
          </div>
        </div>
      </el-form>

      <!-- 日志组 -->
      <el-card class="log-card shadow-card">
        <template #header>
          <div class="card-header">
            <h3 class="section-title">运行日志</h3>
            <el-badge :value="logs.length" type="primary" class="log-badge">
              <el-button size="small" type="info" @click="exportLogs" title="导出日志">
                导出日志
              </el-button>
            </el-badge>
          </div>
        </template>
        <el-scrollbar height="400px" class="log-scrollbar">
          <div class="log-container">
            <transition-group name="log-item" tag="div">
              <div v-for="(log, index) in logs" :key="index" 
                class="log-item"
                :class="{
                  'log-success': log.includes('成功') || log.includes('success'),
                  'log-error': log.includes('失败') || log.includes('错误') || log.includes('error'),
                  'log-info': log.includes('[')
                }"
              >
                {{ log }}
              </div>
            </transition-group>
          </div>
        </el-scrollbar>
      </el-card>

      <!-- 作者信息 -->
      <div class="author-info">
        <el-divider>作者信息</el-divider>
        <p>Author: Eddy</p>
      </div>
    </el-card>

    <!-- 确认对话框 -->
    <el-dialog v-model="confirmDialog.visible" :title="confirmDialog.title" width="40%" center>
      <div class="dialog-content">
        <!-- <Warning class="dialog-icon" /> -->
        <span>{{ confirmDialog.content }}</span>
      </div>
      <template #footer>
        <el-button @click="confirmDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { tradingToolApi } from '@/api/tradingTool.api'
import {
  Delete,
  Check,
  ArrowRight,
  Stopwatch,
  DocumentCopy,
  Document,
  Loading,
  Warning
} from '@element-plus/icons-vue'

// 表单数据
const formData = reactive({
  ip: 'tcp.internal.lifebyte.dev',
  port: '28080',
  serverType: 'MT4',
  function: '1',
  serverName: 'CRM_dev_1',
  ta: '153735',
  cmd: 'buy',
  volume: '',
  comment: 'test',
  price: '0.66',
  openNum: 1,
  symbol: 'AUDUSD',
  threadNum: 1
})

// 常量配置
const orderTypeDict = { buy: 0, sell: 1 }
const defaultSymbols = ['AUDUSD', 'EURUSD', 'GBPUSD', 'AUDCAD', 'GBPJPY']

// 日志数组
const logs = ref<string[]>([])

// 输出日志函数
function addLog(logText: string) {
  const info = `[${new Date().toLocaleString()}] ${logText}`
  logs.value.push(info)
  
  // 限制日志行数
  if (logs.value.length > 500) {
    logs.value.shift()
  }
}

// 状态变量
const isRunning = ref(false)
const wsConnections = ref<WebSocket[]>([]) // 保留此引用用于跟踪连接

// 确认对话框
const confirmDialog = reactive({
  visible: false,
  title: '',
  content: '',
  callback: () => {}
})

// 监听服务器类型变化
watch(() => formData.serverType, (newVal) => {
  addLog(`服务器类型已更改为: ${newVal}`)
  if (newVal === 'MT5') {
    formData.function = '1'
  }
})

// 测试连接 - 调用API接口
async function testConnect() {
  const { ip, port } = formData
  
  if (!ip || !port) {
    addLog('检查ip端口是否正确...')
    return
  }

  addLog(`测试中...正在连接${ip}:${port}`)
  
  try {
    // 调用API并解构响应数据
    const result = await tradingToolApi.testConnection({
      ip,
      port
    })
    
    // 确保正确访问响应数据
    const response = result.data || result;
    
    if (response.status === 'success') {
      addLog(`地址访问成功...${response.message ? ' - ' + response.message : ''}`)
      ElMessage.success(response.message || '地址访问成功')
    } else {
      addLog('地址链接失败，请检查地址是否正确或网络是否正常')
      ElMessage.error(response.message || '地址链接失败')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || String(error)
    addLog(`测试连接失败: ${errorMsg}`)
    ElMessage.error(errorMsg)
  }
}

// 输出日志 - 已通过useTradingLive的addLog方法实现

// 当前运行的任务ID
const currentRunId = ref('')

// 提交任务 - 调用API接口
async function submit() {
  const { ip, port } = formData
  
  if (!ip || !port) {
    addLog('IP和端口不能为空')
    ElMessage.warning('IP和端口不能为空')
    return
  }

  // 构造请求参数
  const requestData = {
    ip,
    port,
    server_type: formData.serverType,
    function: formData.function,
    server_name: formData.serverName,
    ta: formData.ta,
    cmd: formData.cmd,
    volume: formData.volume,
    comment: formData.comment,
    price: formData.price,
    open_num: formData.openNum || 1,
    symbol: formData.symbol?.toUpperCase() || '',
    thread_num: formData.threadNum
  }

  // 验证必要字段
  const requiredFields: {[key: string]: string} = {
    ta: '交易帐号',
    symbol: '交易产品',
    volume: '交易手数',
    server_name: '服务器名称',
    price: '价格',
    comment: '备注',
  }
  
  for (const [field, label] of Object.entries(requiredFields)) {
    if (!requestData[field as keyof typeof requestData]) {
      ElMessage.warning(`${label} 不能为空!`)
      return
    }
  }
    
  addLog(`功能：${requestData.function} | 服务器类型：${requestData.server_type}`)
  
  try {
    // 调用交易执行接口并解构响应数据
    const result = await tradingToolApi.trade(requestData)
    
    // 确保正确访问响应数据
    const response = result.data || result;
    
    if (response.status === 'success') {
      isRunning.value = true
      currentRunId.value = response.run_id
      
      addLog(`交易任务已开始，run_id: ${response.run_id}`)
      addLog(`WebSocket URL: ${response.websocket_url}`)
      
      // 连接WebSocket获取实时日志
      if (response.websocket_url) {
        await connectWebSocket(response)
      }
      
      ElMessage.success(response.message)
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || String(error)
    addLog(`交易执行失败: ${errorMsg}`)
    ElMessage.error(errorMsg)
  }
}

// WebSocket消息处理
function handleWebSocketMessage(event: MessageEvent) {
  try {
    const data = JSON.parse(event.data)
    
    switch (data.type) {
      case 'log':
        addLog(data.message)
        break
      case 'status':
        addLog(`状态更新: ${data.status} - ${data.message}`)
        // 如果任务完成或停止，更新状态
        if (data.status === 'completed' || data.status === 'stopping') {
          isRunning.value = false
        }
        break
      case 'config':
        addLog(`配置信息: ${JSON.stringify(data.config)}`)
        break
      default:
        addLog(`[WebSocket] ${JSON.stringify(data)}`)
    }
  } catch (error) {
    addLog(`[WebSocket] ${event.data}`)
  }
}

// 连接WebSocket
async function connectWebSocket(response: any) {
  try {
    // 使用接口返回的websocket_url
    const ws = new WebSocket(response.websocket_url)
    
    ws.onopen = () => {
      addLog(`WebSocket连接已建立: ${response.websocket_url}`)
    }
    
    ws.onmessage = handleWebSocketMessage
    
    ws.onerror = (error) => {
      addLog(`WebSocket错误: ${error}`)
      ws.close()
    }
    
    ws.onclose = () => {
      addLog('WebSocket连接已关闭')
      // 移除关闭的连接
      const index = wsConnections.value.findIndex(conn => conn === ws)
      if (index > -1) {
        wsConnections.value.splice(index, 1)
      }
    }
    
    // 保存WebSocket连接
    wsConnections.value.push(ws)
  } catch (error) {
    addLog(`WebSocket连接失败: ${error}`)
  }
}

// 停止交易 - 调用API接口
async function stopThreads() {
  if (!currentRunId.value) {
    addLog('没有正在执行的交易任务')
    ElMessage.warning('没有正在执行的交易任务')
    return
  }
  
  try {
    // 调用API并解构响应数据
    const result = await tradingToolApi.stopTrade(0, {
      run_id: currentRunId.value
    })
    
    // 确保正确访问响应数据
    const response = result.data || result;
    
    if (response.status === 'success') {
      // 不立即设置为false，等待WebSocket状态更新
      addLog('已发送停止信号，等待任务结束...')
      ElMessage.success(response.message)
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || String(error)
    addLog(`停止交易失败: ${errorMsg}`)
    ElMessage.error(errorMsg)
  }
}

// 处理手数输入，限制两位小数
const handleVolumeInput = (value: string | number) => {
  // 限制小数位数为2位
  const strValue = String(value);
  if (strValue) {
    const regex = /^\d*\.?\d{0,2}$/;
    if (!regex.test(strValue)) {
      // 如果输入不符合格式，截取到两位小数
      const parts = strValue.split('.');
      if (parts.length > 1) {
        // 保持与formData.volume相同的类型
        const formattedValue = parseFloat(`${parts[0]}.${parts[1].substring(0, 2)}`);
        formData.volume = formattedValue;
      }
    }
  }
}

// 清除日志
function clearLog() {
  confirmDialog.title = '确认清除'
  confirmDialog.content = '你确定要清除所有日志记录吗？此操作不可恢复。'
  confirmDialog.callback = () => {
    logs.value = []
  }
  confirmDialog.visible = true
}

// 导出日志
function exportLogs() {
  if (logs.value.length === 0) {
    ElMessage.warning('没有日志记录可导出')
    return
  }
  
  const logContent = logs.value.join('\n')
  const blob = new Blob([logContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trading_log_${new Date().toLocaleString().replace(/\//g, '-').replace(/:/g, '-')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  addLog('日志已成功导出')
}

// 处理确认
function handleConfirm() {
  confirmDialog.callback()
  confirmDialog.visible = false
}

// 保存基本信息
function saveBasicInfo() {
  const infos = {
    ip: formData.ip,
    port: formData.port,
    serverName: formData.serverName,
    trading_account: formData.ta,
    volume: formData.volume,
    comment: formData.comment,
    function: formData.function,
    serverType: formData.serverType,
    price: formData.price
  }
  
  // 创建下载链接
  const blob = new Blob([JSON.stringify(infos, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trading_info_${new Date().getTime()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  addLog('基本信息已保存')
}

// 处理文件上传
function handleFileUpload(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data = JSON.parse(content)
      
      // 更新表单数据
      formData.ip = data.ip || formData.ip
      formData.port = data.port || formData.port
      formData.serverName = data.server_name || ''
      formData.ta = data.trading_account || ''
      formData.volume = data.volume || ''
      formData.comment = data.comment || ''
      formData.price = data.price || ''
      formData.function = data.function || '1'
      formData.serverType = data.server_type || 'MT4'
      
      addLog('基本信息已从文件加载')
    } catch (error) {
      ElMessage.error('打开文件失败: 文件格式不正确')
    }
  }
  reader.readAsText(file)
  return false // 阻止默认上传
}

// 组件卸载时清理WebSocket连接
onUnmounted(() => {
  // 关闭所有WebSocket连接
  wsConnections.value.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
  })
  wsConnections.value = []
})
</script>

<style scoped>
.trading-tool-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-card {
  margin-bottom: 30px;
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.shadow-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.shadow-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.form-container {
  padding: 24px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  transition: transform 0.2s ease;
}

.form-section:hover {
  transform: translateY(-2px);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.form-input {
  width: 100%;
  transition: all 0.3s ease;
}

.form-input:hover {
  border-color: #c0c4cc;
}

.form-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.radio-group {
  width: 100%;
}

.action-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-top: 10px;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 12px;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.run-id {
  font-size: 14px;
  color: #606266;
  font-family: monospace;
}

.log-card {
  margin-top: 20px;
  border-radius: 12px;
  border: none;
}

.log-badge {
  transform: translate(0, -4px);
}

.log-scrollbar {
  border-radius: 8px;
}

.log-container {
  background-color: #1e1e1e;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.log-item {
  margin-bottom: 6px;
  word-break: break-all;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-align: left;
}

.log-item:last-child {
  margin-bottom: 0;
}

.log-info {
  color: #d4d4d4;
}

.log-success {
  color: #4ec9b0;
  background-color: rgba(78, 201, 176, 0.1);
}

.log-error {
  color: #f44747;
  background-color: rgba(244, 71, 71, 0.1);
}

.log-item-enter-active,
.log-item-leave-active {
  transition: all 0.3s ease;
}

.log-item-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.log-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.author-info {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.dialog-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 0;
}

.dialog-icon {
  color: #e6a23c;
  font-size: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trading-tool-container {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .status-indicator {
    margin-left: 0;
    justify-content: center;
  }
  
  .form-section {
    padding: 16px;
  }
}
</style>