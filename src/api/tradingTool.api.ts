import { http } from '@/utils/requests'

// 接口集合
export const tradingToolApi = {
  /** 获取文件列表 */
  testConnection: (params: any) => 
    http.post('/test-connection/', params),

  // 上传文件时，当参数为FormData时，不要设置Content-Type，让浏览器自动处理
  trade: (params: Object) => 
    http.post('/trade/', params),

  stopTrade: (id: number, params: Object) => 
    http.post(`/stop-trade/`, params),

  // 保存交易配置
  saveConfig: (params: { name: string; trade_data: any }) => 
    http.post('/mt-tool-config/', params),

  // 获取交易配置列表
  getConfigList: () => 
    http.get('/mt-tool-config/'),

  // 删除交易配置
  deleteConfig: (id: number) => 
    http.delete(`/mt-tool-config/${id}/`),

  // 根据ID获取交易配置
  getConfigById: (id: number) => 
    http.get(`/mt-tool-config/${id}/`),

  // 更新交易配置
  updateConfig: (id: number, params: { name: string; trade_data: any }) => 
    http.put(`/mt-tool-config/${id}/`, params),
}
