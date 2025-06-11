import { http } from '@/utils/requests'
import type { BaseResponse } from './types'

// 接口集合
export const variableApi = {
  /** 获取项目列表 */
  getVariableList: (params: any) => 
    http.get('/variable/', params),
  /** 创建项目 */
  createVariable: (params: Object) => 
    http.post('/variable/', params),
  /** 编辑项目 */
  updateVariable: (id: Number, params: Object) => 
    http.put<BaseResponse>(`/variable/${id}/`, params),
  /** 删除项目 */
  deleteVariable: (id: number) => 
    http.delete<BaseResponse>(`/variable/${id}/`),

  updatePythonCode: (id: number, params: Object) =>
    http.patch<BaseResponse>(`/python-code/${id}/`, params),

  /** 获取Python函数列表 */
  getPythonCodeList: () => 
    http.get('/python-code/'),

  getPythonFunctionNameList: () =>
    http.get('/python-code/function-list/'),
}
