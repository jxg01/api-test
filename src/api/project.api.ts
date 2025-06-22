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

  /** 获取项目环境列表 */
  getProjectEnvList: (params: any) => 
    http.get('/envs/', params),
  /** 创建 */
  createProjectEnv: (params: any) => 
    http.post('/envs/', params),
  /** 编辑 */
  editProjectEnv: (id: number, params: any) => 
    http.patch(`/envs/${id}/`, params),
  /** 删除 */
  delteProjectEnv: (id: number) => 
    http.delete(`/envs/${id}/`),
  /** 获取测试环境关联的数据库 */ 
  getEnvRelatedDB: (params: any) =>
    http.get('/env_related_db/', params),
  /** 创建测试环境关联的数据库 */
  createEnvRelatedDB: (params: any) =>
    http.post('/db-config/', params),
  /** 编辑测试环境关联的数据库 */
  editEnvRelatedDB: (id: number, params: any) =>
    http.patch(`/db-config/${id}/`, params),
}
