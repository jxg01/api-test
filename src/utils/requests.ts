import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { DEFAULT_ERROR_MESSAGE } from '@/constants/errorMessages'

// 定义响应数据格式
// export interface ResponseData<T = any> {
//   code: number
//   data: T
//   message: string
// }

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取基础URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 标志位，防止多次跳转登录
let isRedirecting = false

// 响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
    const data = response.data
    console.log('response => ', data)
    console.log('response ccee => ', data.code)
    // 判断是否包含错误码
    console.log('response data => ', data)
    if (typeof data === 'object' && data !== null && 'code' in data) {
      console.log('in if code in data')
      if (data.code !== 0) {  
        if (data.code === 'token_not_valid' || data.code === 401) {
          console.log('in if code token_not_valid')
          // 处理 token 过期
          if (!isRedirecting) {
            isRedirecting = true
            ElMessage.error('登录已过期，请重新登录')
            const userStore = useUserStore()
            userStore.clearToken() // 清除本地 token
            setTimeout(() => {
              window.location.href = '/login' // 跳转到登录页面
            }, 1000)
          }
        }
        // 接口失败，抛出错误
        const errorMessage = data.message || DEFAULT_ERROR_MESSAGE
        ElMessage.error(errorMessage)
        return Promise.reject(errorMessage)
    }
    // 接口成功，直接返回数据
    return data

  //   // 情况1：存在错误码（业务失败）
  //   if (typeof data === 'object' && data !== null && 'code' in data) {
  //     if (data.code === 'token_not_valid') {
  //       console.log('in else if code token ')
  //       let message = '认证失败，请重新登录'
  //       ElMessage({
  //         message,
  //         type: 'error',
  //         duration: 5 * 1000
  //       })
  //       // 清除token并跳转登录
  //       useUserStore().clearToken()
  //       window.location.href = '/login'
  //       return Promise.reject('error reject')
  //     }

  //     else if (data.code !== 0) { // 假设0为成功码
  //       // 创建增强错误对象
  //       console.log('in if data code != 0')
  //       const error = new Error(data.message || DEFAULT_ERROR_MESSAGE)
  //       if (ERROR_MESSAGE_MAP[Number(data.code)]) {
  //         ElMessage({
  //           message: data.message,
  //           type: 'error',
  //           duration: 5 * 1000
  //         })
  //       }
  //       return Promise.reject(error)
  //     } 
  //     // 返回包装结构中的有效数据（兼容场景2）
  //     return data // 优先取data字段，不存在则返回整个对象
  //   } 

  //   // 情况2：直接返回业务数据（场景1）
  //   return data
  }
  return data
},
  (error) => {
    // 处理HTTP网络错误
    let message = ''
    const status = error.response?.status
    switch (status) {
      case 401:
        message = '认证失败，请重新登录'
        // 清除token并跳转登录
        useUserStore().clearToken()
        window.location.href = '/login'
        break
      case 403:
        message = '拒绝访问'
        break
      case 404:
        message = '请求地址错误'
        break
      case 500:
        message = '服务器故障'
        break
      default:
        message = '网络连接故障'
    }
    
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// 封装核心请求函数
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service(config)
}

// 封装常用方法
export const http = {
  get: <T = any>(url: string, params?: object, config?: AxiosRequestConfig) => 
    request<T>({ ...config, url, method: 'GET', params }),

  post: <T = any>(url: string, data?: object, config?: AxiosRequestConfig) => 
    request<T>({ ...config, url, method: 'POST', data }),

  put: <T = any>(url: string, data?: object, config?: AxiosRequestConfig) => 
    request<T>({ ...config, url, method: 'PUT', data }),

  delete: <T = any>(url: string, params?: object, config?: AxiosRequestConfig) => 
    request<T>({ ...config, url, method: 'DELETE', params })
}

export default http
