// src/composables/useTradingLive.ts
import { ref } from 'vue'

/**
 * 交易工具WebSocket连接管理
 * 用于处理交易工具的实时日志推送
 */
export function useTradingLive() {
  // WebSocket连接引用数组
  const wsConnections = ref<WebSocket[]>([])
  // 日志数组
  const logs = ref<string[]>([])
  // 连接状态
  const isConnected = ref(false)
  
  /**
   * 连接到交易服务器的WebSocket
   * @param config 交易配置信息，包含ip、port等
   * @param logHandler 自定义日志处理函数，可选
   * @returns WebSocket实例
   */
  function connect(config: { ip: string; port: string }, logHandler?: (log: string) => void) {
    try {
      // 构造WebSocket URL
      const wsProtocol = config.ip.startsWith('https') ? 'wss' : 'ws'
      const wsUrl = `${wsProtocol}://${config.ip.replace(/^https?:\/\//, '')}:${config.port}/ws/logs`
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        isConnected.value = true
        const info = `[${new Date().toLocaleString()}] WebSocket连接已建立: ${wsUrl}`
        logs.value.push(info)
        logHandler?.(info)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const message = data.message || event.data
          const logMsg = `[${new Date().toLocaleString()}] [WebSocket] ${message}`
          logs.value.push(logMsg)
          logHandler?.(logMsg)
        } catch {
          const logMsg = `[${new Date().toLocaleString()}] [WebSocket] ${event.data}`
          logs.value.push(logMsg)
          logHandler?.(logMsg)
        }
      }
      
      ws.onerror = (error) => {
        const logMsg = `[${new Date().toLocaleString()}] WebSocket错误: ${error}`
        logs.value.push(logMsg)
        logHandler?.(logMsg)
        ws.close()
      }
      
      ws.onclose = () => {
        isConnected.value = wsConnections.value.some(conn => conn.readyState === WebSocket.OPEN)
        // 移除关闭的连接
        const index = wsConnections.value.findIndex(conn => conn === ws)
        if (index > -1) {
          wsConnections.value.splice(index, 1)
        }
      }
      
      // 保存WebSocket连接
      wsConnections.value.push(ws)
      
      return ws
    } catch (error) {
      const logMsg = `[${new Date().toLocaleString()}] WebSocket连接失败: ${error}`
      logs.value.push(logMsg)
      logHandler?.(logMsg)
      throw error
    }
  }
  
  /**
   * 断开指定的WebSocket连接
   * @param ws 要断开的WebSocket实例
   */
  function disconnect(ws?: WebSocket) {
    if (ws) {
      try {
        ws.close()
        const index = wsConnections.value.findIndex(conn => conn === ws)
        if (index > -1) {
          wsConnections.value.splice(index, 1)
        }
      } catch (error) {
        console.error('断开WebSocket连接失败:', error)
      }
    }
    
    isConnected.value = wsConnections.value.some(conn => conn.readyState === WebSocket.OPEN)
  }
  
  /**
   * 断开所有WebSocket连接
   */
  function disconnectAll() {
    wsConnections.value.forEach(ws => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      } catch (error) {
        console.error('断开WebSocket连接失败:', error)
      }
    })
    
    wsConnections.value = []
    isConnected.value = false
  }
  
  /**
   * 添加自定义日志
   * @param logText 日志文本
   */
  function addLog(logText: string) {
    const info = `[${new Date().toLocaleString()}] ${logText}`
    logs.value.push(info)
    
    // 限制日志行数
    if (logs.value.length > 500) {
      logs.value.shift()
    }
    
    return info
  }
  
  /**
   * 清除所有日志
   */
  function clearLogs() {
    logs.value = []
  }
  
  return {
    // 状态
    wsConnections,
    logs,
    isConnected,
    
    // 方法
    connect,
    disconnect,
    disconnectAll,
    addLog,
    clearLogs
  }
}
