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
    getTestCaseSimpleList: () => 
      http.get('/testcases/simple-cases/'),

}
