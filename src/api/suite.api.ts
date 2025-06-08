import { http } from '@/utils/requests'

// 接口集合
export const suiteApi = {
  /** 获取列表 */
  getSuiteList: (params: any) => 
    http.get('/suite/', params),
  /** 创建 */
  createSuite: (params: Object) => 
    http.post('/suite/', params),
  /** 获取详情 */
  getSuiteDetail: (id: number) => 
    http.get(`/suite/${id}/`),

  /** 更新 */
  updateSuite: (id: number, params: Object) => 
    http.put(`/suite/${id}/`, params),

  /** 删除 */
  deleteSuite: (id: number) => 
    http.delete(`/suite/${id}/`),

  /** 获取套件执行记录 */
  getSuiteExecutionHistory: (params: any) => 
    http.get('/SuiteExecutionResult/', params),

  runSuite: (id: number, params: any) =>
    http.post(`/suite/${id}/execute/`, params),


}
