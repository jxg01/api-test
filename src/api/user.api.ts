import { http } from '@/utils/requests'
import type { BaseResponse, PaginationParams } from './types'

// 用户相关类型
export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: Number
  username: string
  email: string
  password: string
  password_confirm: string
}

// 接口集合
export const userApi = {
  /** 用户登录 */
  login: (data: LoginParams) => 
    http.post<BaseResponse>('/login/', data),

  /** 获取用户列表 */
  getUserList: (params: PaginationParams) => 
    http.get('/users/', params),

    /** 获取用户列表 */
  createUser: (params: Object) => 
    http.post('/users/', params),

  /** 编辑用户 */
  updateUser: (id: Number, params: Object) => 
    http.put<BaseResponse>(`/users/${id}/`, params),

  /** 删除用户 */
  deleteUser: (id: number) => 
    http.delete<BaseResponse>(`/users/${id}/`),

  /** 注册用户 */
  registerUser: (params: Object) => 
    http.post('/register/', params),
}
