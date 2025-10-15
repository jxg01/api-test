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

}
