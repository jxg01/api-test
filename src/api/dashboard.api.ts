import { http } from '@/utils/requests'

// 接口集合
export const dashboardApi = {
  /** 获取列表 */
  getRecent7DayHistorySummary: () => 
    http.get('/home/execution_trend/'),
  /** 获取详情 */
  getExecutionCaseAndSuiteHistory: (params: any) => 
    http.get('/execution-history/', params),

  /** 首页统计 */
  getSummary: () => 
    http.get('/home/summary/'),

}
