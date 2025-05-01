import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态定义
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<{ name: string; roles: string[] } | null>(null)
  const usernameDisplay = ref(localStorage.getItem('username') || '')

  // Actions
  const setToken = (newToken: string, username: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', username)
  }

  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    userInfo.value = null
  }

  const login = async (credentials: { username: string; password: string }) => {
    // 实际应该调用登录接口
    const mockToken = 'mock-token-123'
    setToken(mockToken)
    userInfo.value = {
      name: 'Admin',
      roles: ['admin']
    }
  }

  const logout = () => {
    clearToken()
    // 这里可以添加其他清理逻辑
  }

  return {
    token,
    userInfo,
    setToken,
    clearToken,
    login,
    logout
  }
})
