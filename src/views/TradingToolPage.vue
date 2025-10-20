<template>
  <div class="trading-tool-container">
    <el-card class="main-card shadow-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">交易工具</h2>
          <div class="header-actions">
            <el-button type="success" size="small" :icon="Document" :title="'保存当前配置'" @click.stop="saveBasicInfo">
              {{ currentConfigId ? '修改基本信息' : '保存基本信息' }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- 已保存的配置卡片 -->
      <div v-if="configList.length > 0" class="saved-configs">
        <el-row :gutter="15">
          <!-- <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="config in configList" :key="config.id"> -->
          <el-col :xs="24" :sm="12" :md="6" :lg="4" v-for="config in configList" :key="config.id">
            <el-card 
              class="config-item" 
              :class="{ 'active-config': currentConfigId === config.id }"
              @click="handleConfigClick(config)"
            >
              <div class="config-header-with-delete">
                <h4 class="config-name">{{ config.name }}</h4>
                <el-button 
                  link 
                  type="danger" 
                  size="small" 
                  @click.stop="confirmDeleteConfig(config)"
                  class="delete-button"
                >
                  删除
                </el-button>
              </div>
              <span class="config-time">{{ formatTime(config.created_at) }}</span>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 基本信息组 -->
      <el-form :model="formData" label-width="100px" class="form-container">
        <!-- 链接信息区域 -->
        <div class="form-section">
          <h3 class="section-title">基础信息</h3>
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
                    <el-button type="info" @click="testConnect" size="small" :loading="testLoading">测试连接</el-button>
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
                <el-input :min="0" v-model.number="formData.openNum" type="number" placeholder="请输入下单次数" class="form-input"></el-input>
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
            <el-col :xs="24" :sm="24" :md="24" :lg="8">
              <el-form-item label="备注:" prop="comment">
                <el-input v-model="formData.comment" placeholder="请输入备注" class="form-input"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="8">
              <el-form-item label="持仓时间:" prop="holderTime">
                <el-input :min="0" v-model.number="formData.holderTime" type="number" placeholder="请输入持仓时间" class="form-input"></el-input>
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
              <el-button 
                size="small" type="warning" 
                :icon="Delete" 
                title="清除日志"
                @click="clearLog" 
              >
                清除日志
              </el-button>
              <el-button size="small" type="info" @click="exportLogs" title="导出日志" :icon="Download" >
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
      <el-dialog v-model="confirmDialog.visible" :title="confirmDialog.title" width="40%" >
        <div class="dialog-content">
          <!-- <Warning class="dialog-icon" /> -->
          <span>{{ confirmDialog.content }}</span>
        </div>
        <template #footer>
          <el-button @click="confirmDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </template>
      </el-dialog>

      <!-- 保存配置对话框 -->
      <el-dialog v-model="saveDialog.visible" title="保存配置" width="40%">
        <el-form :model="saveDialog.form" label-width="80px">
          <el-form-item label="配置名称" prop="name">
            <el-input v-model="saveDialog.form.name" placeholder="请输入配置名称"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="saveDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmSaveConfig">确定</el-button>
        </template>
      </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted, onMounted } from 'vue'
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
  Warning,
  Download
} from '@element-plus/icons-vue'

// 表单数据
// const formData = reactive({
//   ip: 'tcp.internal.lifebyte.dev',
//   port: '28080',
//   serverType: 'MT4',
//   function: '1',
//   serverName: 'CRM_dev_1',
//   ta: '153735',
//   cmd: 'buy',
//   volume: '' as number | string,
//   comment: 'test',
//   price: '0.66',
//   openNum: 1,
//   symbol: 'AUDUSD',
//   threadNum: 1,
//   holderTime: 0
// })

const formData = reactive({
  ip: '',
  port: '',
  serverType: 'MT4',
  function: '1',
  serverName: '',
  ta: '',
  cmd: 'buy',
  volume: '' as number | string,
  comment: '',
  price: '',
  openNum: '' as number | string,
  symbol: '',
  threadNum: 1,
  holderTime: '' as number | string,
})

// 常量配置
const orderTypeDict = { buy: 0, sell: 1 }
const defaultSymbols = ['AUDUSD', 'EURUSD', 'GBPUSD', 'AUDCAD', 'GBPJPY']

// 日志数组
const logs = ref<string[]>([])

// 输出日志函数
function addLog(logText: string, isFromWebSocket = false) {
  const info = isFromWebSocket ? logText : `[${new Date().toLocaleString()}] ${logText}`
  logs.value.push(info)
  
  // 限制日志行数
  if (logs.value.length > 500) {
    logs.value.shift()
  }
  
  // 滚动到最新日志
  setTimeout(() => {
    const logContainer = document.querySelector('.log-scrollbar .el-scrollbar__wrap')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, 0)
}

// 状态变量
const isRunning = ref(false)
const wsConnections = ref<WebSocket[]>([]) // 保留此引用用于跟踪连接

// 确认对话框配置
const confirmDialog = reactive({
  visible: false,
  title: '',
  content: '',
  callback: () => {}
})

// 保存配置对话框
const saveDialog = reactive({
  visible: false,
  form: {
    name: ''
  }
})

// 配置列表
const configList = ref<any[]>([])

// 当前选中的配置ID
const currentConfigId = ref<number | null>(null)

// 点击配置卡片
function handleConfigClick(config: any) {
  // 如果任务正在运行，不允许切换配置
  if (isRunning.value) {
    ElMessage.warning('当前任务正在运行，无法切换配置')
    return
  }
  
  // 如果点击的是当前选中的配置，不做任何操作
  if (currentConfigId.value === config.id) {
    return
  }
  
  // 加载选中的配置
  loadConfig(config)
}

// 加载中状态
const isLoading = ref(false)

// 监听服务器类型变化
watch(() => formData.serverType, (newVal) => {
  addLog(`服务器类型已更改为: ${newVal}`)
  if (newVal === 'MT5') {
    formData.function = '1'
  }
})

const testLoading = ref(false)

// 测试连接 - 调用API接口
async function testConnect() {
  const { ip, port } = formData
  
  if (!ip || !port) {
    addLog('检查ip端口是否正确...')
    return
  }
  testLoading.value = true
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
    testLoading.value = false
  } catch (error: any) {
    testLoading.value = false
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
  console.log('提交的表单数据:', formData)
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
    thread_num: formData.threadNum || 1,
    holder_time: formData.holderTime || 0,
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
    } else {
      addLog(`交易请求失败: ${response.message}`)
      ElMessage.error(response.message)
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
        addLog(data.message, true)
        break
      case 'status':
        addLog(`状态更新: ${data.status} - ${data.message}`, true)
        // 如果任务完成或停止，更新状态
        if (data.status === 'completed' || data.status === 'stopping') {
          isRunning.value = false
        }
        break
      case 'config':
        addLog(`配置信息: ${JSON.stringify(data.config)}`, true)
        break
      default:
        addLog(`[WebSocket] ${JSON.stringify(data)}`, true)
    }
  } catch (error) {
    addLog(`[WebSocket] ${event.data}`, true)
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

// 加载配置列表
async function loadConfigList() {
  try {
    isLoading.value = true
    const response = await tradingToolApi.getConfigList()
    configList.value = response.data || []
  } catch (error) {
    ElMessage.error('加载配置列表失败')
    console.error('加载配置列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 保存基本信息
function saveBasicInfo() {
  if (currentConfigId.value) {
    // 修改模式
    saveDialog.form.name = configList.value.find(c => c.id === currentConfigId.value)?.name || ''
    saveDialog.visible = true
  } else {
    // 新增模式
    saveDialog.form.name = ''
    saveDialog.visible = true
  }
}

// 确认保存配置
async function confirmSaveConfig() {
  if (!saveDialog.form.name.trim()) {
    ElMessage.warning('请输入配置名称')
    return
  }

  try {
    isLoading.value = true
    const tradeData = {
      ip: formData.ip,
      port: formData.port,
      serverName: formData.serverName,
      trading_account: formData.ta,
      volume: formData.volume,
      comment: formData.comment,
      function: formData.function,
      serverType: formData.serverType,
      price: formData.price,
      cmd: formData.cmd,
      openNum: formData.openNum,
      symbol: formData.symbol,
      threadNum: formData.threadNum || 1,
      holderTime: formData.holderTime || 0,
    }

    let response
    if (currentConfigId.value) {
      // 更新配置
      response = await tradingToolApi.updateConfig(currentConfigId.value, {
        name: saveDialog.form.name.trim(),
        trade_data: tradeData
      })
      addLog(`配置已更新: ${saveDialog.form.name}`)
    } else {
      // 新增配置
      response = await tradingToolApi.saveConfig({
        name: saveDialog.form.name.trim(),
        trade_data: tradeData
      })
      addLog(`配置已保存: ${saveDialog.form.name}`)
    }

    // 操作成功后关闭弹窗
    ElMessage.success(currentConfigId.value ? '配置更新成功' : '配置保存成功')
    saveDialog.visible = false
    await loadConfigList()
  } catch (error) {
    ElMessage.error(currentConfigId.value ? '配置更新失败' : '配置保存失败')
    console.error('保存配置失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载配置
async function loadConfig(config: any) {
  try {
    isLoading.value = true
    const response = await tradingToolApi.getConfigById(config.id)
    const tradeData = response?.trade_data
    console.log('tradeData:', tradeData)
    
    if (tradeData) {
      // 更新表单数据
      formData.ip = tradeData.ip || formData.ip
      formData.port = tradeData.port || formData.port
      formData.serverName = tradeData.serverName || ''
      formData.ta = tradeData.trading_account || ''
      formData.volume = tradeData.volume || ''
      formData.comment = tradeData.comment || ''
      formData.function = tradeData.function || '1'
      formData.serverType = tradeData.serverType || 'MT4'
      formData.price = tradeData.price || ''
      formData.cmd = tradeData.cmd || 'buy'
      formData.openNum = tradeData.openNum || 1
      formData.symbol = tradeData.symbol || 'AUDUSD'
      formData.threadNum = tradeData.threadNum || 1
      formData.holderTime = tradeData.holderTime || 0
      
      currentConfigId.value = config.id
      addLog(`已加载配置: ${config.name}`)
      ElMessage.success(`已加载配置: ${config.name}`)
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
    console.error('加载配置失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 确认删除配置
function confirmDeleteConfig(config: any) {
  confirmDialog.title = '确认删除'
  confirmDialog.content = `确定要删除配置"${config.name}"吗？此操作不可恢复。`
  confirmDialog.callback = () => deleteConfig(config.id)
  confirmDialog.visible = true
}

// 删除配置
async function deleteConfig(id: number) {
  try {
    isLoading.value = true
    await tradingToolApi.deleteConfig(id)
    
    // 如果删除的是当前加载的配置，清除当前配置ID
    if (currentConfigId.value === id) {
      currentConfigId.value = null
    }
    
    await loadConfigList()
    addLog('配置已删除')
    ElMessage.success('配置删除成功')
  } catch (error) {
    ElMessage.error('配置删除失败')
    console.error('删除配置失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 格式化时间
function formatTime(timeString: string) {
  try {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return timeString
  }
}

// 组件挂载时加载配置列表
onMounted(() => {
  loadConfigList()
})

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
  /* padding: 16px 24px; */
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

.form-section {
  /* margin-bottom: 30px; */
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  transition: transform 0.2s ease;
}

.form-section:hover {
  transform: translateY(-1px);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  text-align: left;
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
  margin-top: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.saved-configs {
  margin-bottom: 20px;
}

.saved-configs .el-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: -15px; /* 负边距抵消行内元素的下边距 */
}

.saved-configs .el-row > .el-col {
  margin-bottom: 15px; /* 为每列添加垂直间距 */
}

.config-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  height: 100%;
}

.config-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.5);
}

.config-item.active-config {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.3);
  background-color: #ecf5ff;
}

.config-header-with-delete {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.delete-button {
  margin-top: -5px;
  margin-right: -5px;
}

.config-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-time {
  font-size: 12px;
  color: #909399;
}

.config-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.el-loading-mask {
  z-index: 2000 !important;
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