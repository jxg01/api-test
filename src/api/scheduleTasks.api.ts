import { http } from '@/utils/requests'
import type { BaseResponse } from './types'

interface Task {
  id: number;
  name: string;
  task_type: string;
  enabled: number;
  cron: string;
  created_by: string;
  updated_by: string;
}

// 接口集合
export const scheduleTasksApi = {
  /** 获取项目列表 */
  getScheduleTasksList: () => 
    http.get('/scheduled-tasks/'),
  /** 创建任务 */
  createScheduleTask: (params: Object) => 
    http.post<Task>('/scheduled-tasks/', params),
  /** 编辑任务 */
  editScheduleTask: (id: number, params: Object) => 
    http.put<BaseResponse>(`/scheduled-tasks/${id}/`, params),
  /** 删除任务 */
  deleteScheduleTask: (id: number) => 
    http.delete<BaseResponse>(`/scheduled-tasks/${id}/`),
}