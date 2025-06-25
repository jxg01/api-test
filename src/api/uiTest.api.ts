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

}
