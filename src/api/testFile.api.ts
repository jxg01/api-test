import { http } from '@/utils/requests'

// 接口集合
export const testFileApi = {
  /** 获取文件列表 */
  getFileList: (params: any) => 
    http.get('/ui-test-files/', params),

  // 上传文件时，当参数为FormData时，不要设置Content-Type，让浏览器自动处理
  createFile: (params: Object) => 
    http.post('/ui-test-files/', params, {
      headers: {
        // 当使用FormData时，让浏览器自动设置Content-Type
        'Content-Type': params instanceof FormData ? undefined : 'application/json'
      }
    }),

  updateFile: (id: number, params: Object) => 
    http.patch(`/ui-test-files/${id}/`, params),

  deleteFile: (id: number) => 
    http.delete(`/ui-test-files/${id}/`),
}