import { http } from '@/utils/requests'

// 接口集合
export const uiTestApi = {
  /** 获取接口列表 */
  getElementPageList: (params: any) => 
    http.get('/ui-elements/get-pages/', params),

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
    http.get('/ui-modules/', params)

}
