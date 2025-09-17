import { http } from '@/utils/requests'

// 接口集合
export const uiTestApi = {
  /** 获取接口列表 */
  getElementPageList: (params: any) => 
    http.get('/ui-elements/get-pages/', params),

  getSimpleElementPageList: (params: any) => 
    http.get('/ui-elements/simple-elements/', params),

  /** 获取元素列表 */
  getElementList: (params: any) => 
    http.get('/ui-elements/', params),

  /** 新增元素 */
  addElement: (data: any) => 
    http.post('/ui-elements/', data), 
  
  /** 更新元素 */
  updateElement: (id: number | string, data: any) =>
    http.put(`/ui-elements/${id}/`, data),

  /** 删除元素 */
  deleteElement: (id: number | string) =>
    http.delete(`/ui-elements/${id}/`),

  /** 获取测试用例模块列表 */
  getModuleList: (params: any) => 
    http.get('/ui-modules/', params),

  createUiModule: (params: any) => 
    http.post('/ui-modules/', params),

  deleteUiModule: (id: number) => 
    http.delete(`/ui-modules/${id}/`),

  /** 新增用例 */
  addUiTestCase: (data: any) => 
    http.post('/ui-testcases/', data),

  /** 编辑用例 */
  updateUiTestCase: (id: number | string, data: any) => 
    http.put(`/ui-testcases/${id}/`, data),

  /** 编辑用例 */
  updateUiTestCaseSimple: (id: number | string, data: any) => 
    http.patch(`/ui-testcases/${id}/`, data),
    
  /** 删除用例 */
  deleteUiTestCase: (id: number | string) => 
    http.delete(`/ui-testcases/${id}/`),

  // 执行用例
  runUiTestCase: (id: number) => 
    http.post(`/ui-testcases/${id}/run/`),

  // 批量执行用例
  runSelectedUiTestCase: (params: any) => 
    http.post("/ui-testcases/run-selected/", params),

  /** 获取测试用例模块列表 */
  getFilesList: () => 
    http.get('/ui-test-files/'),

  /** 获取测试用例模块列表 */
  getExecutionHistory: (params: any) => 
    http.get('/ui-executions/', params),

  
}
