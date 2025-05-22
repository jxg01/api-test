import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { userApi } from '@/api'

interface TokenData {
  access: string
  refresh: string
  expire: number
  username: string
}



export const useUserStore = defineStore('user', {
  // 定义 state
  state: () =>
    reactive({
      token: localStorage.getItem('token') || '',
      refreshToken: localStorage.getItem('refreshToken') || '',
      usernameDisplay: localStorage.getItem('username') || '',
      expire: 0,
      pendingRequests: ref<Array<() => void>>([]),
      isRefreshing: false
    }),

  // 定义 actions
  actions: {
    // 设置 token 和 username
    setToken(data: TokenData) {
      this.token = data.access
      this.refreshToken = data.refresh
      this.usernameDisplay = data.username
      localStorage.setItem('token', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      localStorage.setItem('username', data.username)
    },

    // 清除 token 和 username
    clearToken() {
      this.token = ''
      this.usernameDisplay = ''
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('username')
      window.location.href = '/login'
    },

    // 登录
    async login(InitLoginForm: { username: string; password: string }) {
      const res = await userApi.login(InitLoginForm)
      if (res) {
        this.setToken(res.data)
        return '登录成功'
      }
    },

    async register(registerForm: { username: string; password: string; email: string }) {
      const res = await userApi.registerUser({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        password_confirm: registerForm.password
      })
      if (res) {
        return '注册成功'
      }
    },

    // 登出
    logout() {
      this.clearToken()
    },

      // 未写完
    async fetchCaseList(content: string) {
      const res = await userApi.createUserSuggestion({
        name: content
      })

    }

    

  }
})
