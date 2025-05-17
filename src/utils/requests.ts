import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { DEFAULT_ERROR_MESSAGE } from '@/constants/errorMessages'

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

// 响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
  const data = response.data
  console.log('response.data => ', response.data)
  if (data.code) {
    const errorMessage = data.message || DEFAULT_ERROR_MESSAGE
    ElMessage.error(errorMessage)
    return Promise.reject(errorMessage)
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
        setTimeout(() => {
          window.location.href = '/login' // 跳转到登录页面
        }, 1500)
        break
      case 403:
        message = '没有权限，拒绝访问'
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
    request<T>({ ...config, url, method: 'DELETE', params }),

  patch: <T = any>(url: string, data?: object, config?: AxiosRequestConfig) =>
    request<T>({ ...config, url, method: 'PATCH', data })
}

export default http
