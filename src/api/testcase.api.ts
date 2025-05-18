import { http } from '@/utils/requests'

// 接口集合
export const testCaseApi = {
  /** 获取接口列表 */
  getTestCaseList: (params: any) => 
    http.get('/testcases/', params),

  createTestCaseList: (params: Object) => 
    http.post('/testcases/', params),
}
