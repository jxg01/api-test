import { http } from '@/utils/requests'
import type { BaseResponse } from './types'

// 接口集合
export const projectApi = {
  /** 获取项目列表 */
  getProjectList: (params: any) => 
    http.get('/projects/', params),
  /** 创建项目 */
  createProject: (params: Object) => 
    http.post('/projects/', params),
  /** 编辑项目 */
  editProject: (id: Number, params: Object) => 
    http.put<BaseResponse>(`/projects/${id}/`, params),
  /** 删除项目 */
  deleteProject: (id: number) => 
    http.delete<BaseResponse>(`/projects/${id}/`),
}
