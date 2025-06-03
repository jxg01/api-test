import { http } from '@/utils/requests'

// 接口集合
export const testCaseApi = {
  /** 获取接口列表 */
  getTestCaseList: (params: any) => 
    http.get('/testcases/', params),

  createTestCase: (params: Object) => 
    http.post('/testcases/', params),

  updateTestCase: (id: number, params: Object) => 
    http.patch(`/testcases/${id}/`, params),

  deleteTestCase: (id: number) => 
    http.delete(`/testcases/${id}/`),

  /** 获取接口列表,id name */
  getTestCaseSimpleList: (params: {project_id: number | string}) => 
    http.get('/testcases/simple-cases/', params),

  runTestCase: (id: number, params: Object) => 
    http.post(`/testcases/${id}/execute/`, params),

  /** 获取用例执行记录列表 */
  getTestCaseExecuteHistory: (id: number) => 
    http.get(`/testcases/${id}/history/`),


}
