import { http } from '@/utils/requests'
import type { BaseResponse } from './types'

// 接口集合
export const scheduleTasksApi = {
  /** 获取项目列表 */
  getScheduleTasksList: (params: any) => 
    http.get('/scheduled-tasks/', params),
  /** 创建任务 */
  createScheduleTask: (params: Object) => 
    http.post<BaseResponse>('/scheduled-tasks/', params),
  /** 编辑任务 */
  editScheduleTask: (id: number, params: Object) => 
    http.put<BaseResponse>(`/scheduled-tasks/${id}/`, params),
  /** 删除任务 */
  deleteScheduleTask: (id: number) => 
    http.delete<BaseResponse>(`/scheduled-tasks/${id}/`),
}