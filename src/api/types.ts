// 基础响应类型
export interface BaseResponse<T = any> {
    code: number
    data: T
    message: string
  }
  
  // 分页类型
  export interface PaginationParams {
    page: number
    size: number
    username: string
    email: string
  }
  