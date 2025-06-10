import { http } from '@/utils/requests'

// 接口集合
export const interfaceApi = {
  /** 获取接口列表 */
  getInterfaceList: (params: any) => 
    http.get('/interfaces/', params),

  createInterface: (params: Object) => 
    http.post('/interfaces/', params),

  /** 编辑接口 */
  updateInterface: (id: Number, params: Object) => 
    http.put(`/interfaces/${id}/`, params),

  /** 接口重命名 */
  renameInterface: (id: number, params: any) =>
    http.patch(`/interfaces/${id}/`, params),

  /** 删除接口 */
  deleteInterface: (id: number) => 
    http.delete(`/interfaces/${id}/`),

  // 获取模块列表
  getModuleList: (params: any) =>
      http.get('/modules/', params),

  /** 模块重命名 */
  renameModule: (id: number, params: any) =>
      http.patch(`/modules/${id}/`, params),

  /** 编辑模块 */
  createModule: (params: Object) =>
      http.post('/modules/', params),

  /** 删除模块 */
  deleteModule: (id: number) =>
      http.delete(`/modules/${id}/`),

  /** 获取全部模块id name */
  getModuleAll: (params: any) =>
      http.get('/modules/all/', params),

  runInterface: (params: any) =>
    http.post('/interfaces/run/', params),
}
