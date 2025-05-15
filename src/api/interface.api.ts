import { http } from '@/utils/requests'
import type { BaseResponse } from './types'

// 接口集合
export const interfaceApi = {
    /** 获取接口列表 */
    getInterfaceList: (params: any) => 
      http.get('/interfaces/', params),

    getInterfaceDetail: (id: number) =>
        http.get(`/interfaces/${id}/`),
  
      /** 获取接口列表 */
    createInterface: (params: Object) => 
      http.post('/interfaces/', params),
  
    /** 编辑接口 */
    updateInterface: (id: Number, params: Object) => 
      http.put(`/interfaces/${id}/`, params),

    renameInterface: (id: number, params: any) =>
      http.patch(`/interfaces/${id}/`, params),
  
    /** 删除接口 */
    deleteInterface: (id: number) => 
      http.delete(`/interfaces/${id}/`),

    getModuleList: (params: any) =>
        http.get('/modules/', params),

    renameModule: (id: number, params: any) =>
        http.patch(`/modules/${id}/`, params),
  }
  
