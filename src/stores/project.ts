import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '@/types/project'
import { projectApi } from '@/api'
// 创建一个全局的事件总线，用于通知项目切换
class ProjectEventBus {
  private listeners: Map<string, Function[]> = new Map()
  
  // 注册事件监听
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
    
    // 返回取消订阅的函数
    return () => this.off(event, callback)
  }
  
  // 取消事件监听
  off(event: string, callback: Function) {
    if (!this.listeners.has(event)) return
    
    const callbacks = this.listeners.get(event)!
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
    
    if (callbacks.length === 0) {
      this.listeners.delete(event)
    }
  }
  
  // 触发事件
  emit(event: string, ...args: any[]) {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event)!.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error('Error in project event listener:', error)
      }
    })
  }
}

// 导出全局事件总线实例
export const projectEventBus = new ProjectEventBus()
// 定义项目切换事件类型
export const PROJECT_CHANGED_EVENT = 'project_changed'

const STORAGE_KEY = 'currentProjectId'

export const useProjectStore = defineStore('project', {
  state: () => ({
    current: null as Project | null,
    projectList: [] as Project[],
    // 用于缓存ensureReady的结果，避免短时间内重复调用
    ensureReadyPromise: null as Promise<Project | null> | null,
    lastEnsureReadyTime: 0,
    CACHE_DURATION: 1000, // 缓存1秒钟
  }),

  getters: {
    // 获取当前项目 ID
    currentProjectId: (s) => s.current?.id ?? null,
    projectOptions: (s) => s.projectList.map(p => ({ label: p.name, value: p.id })),
  },

  actions: {
    setCurrent(project: Project) {
      const oldProjectId = this.current?.id
      this.current = project
      // ✅ 持久化当前项目 ID
      localStorage.setItem(STORAGE_KEY, project.id.toString())
      
      // 触发项目切换事件，通知所有订阅者
      if (oldProjectId !== project.id) {
        projectEventBus.emit(PROJECT_CHANGED_EVENT, project.id, oldProjectId)
      }
    },

    // 新增：通过 id 切换
    setCurrentById(id: number | string) {
      const p = this.projectList.find(p => String(p.id) === String(id))
      if (p) this.setCurrent(p)
    },

    // 新增：保证可用（若没列表/没当前就补齐），添加缓存机制避免重复调用
    async ensureReady() {
      const now = Date.now()
      
      // 如果有缓存的Promise且时间在缓存有效期内，直接返回缓存的Promise
      if (this.ensureReadyPromise && (now - this.lastEnsureReadyTime < this.CACHE_DURATION)) {
        return this.ensureReadyPromise
      }
      
      // 创建新的Promise并缓存
      this.ensureReadyPromise = (async () => {
        try {
          if (!this.projectList.length) await this.fetchProjectList()
          if (!this.current) await this.initCurrentProject()
          return this.current
        } catch (error) {
          console.error('Error in ensureReady:', error)
          // 发生错误时清除缓存，以便下次调用能够重新尝试
          this.ensureReadyPromise = null
          throw error
        }
      })()
      
      this.lastEnsureReadyTime = now
      return this.ensureReadyPromise
    },

    async fetchProjectList(): Promise<Project[]> {
      const res = await projectApi.getProjectList({})
      if (res?.data) {
        this.projectList = res.data
        return res.data
      }
      return []
    },

    async initCurrentProject(): Promise<Project | null> {
      // 优先使用已有的projectList数据，避免重复请求
      const list = this.projectList.length > 0 ? this.projectList : await this.fetchProjectList()
      const savedId = localStorage.getItem(STORAGE_KEY)

      let matched = null
      if (savedId) {
        matched = list.find(p => p.id === Number(savedId)) || null
      }

      // 如果 localStorage 无法匹配，则选第一个
      this.current = matched ?? list[0] ?? null

      if (this.current) {
        localStorage.setItem(STORAGE_KEY, this.current.id.toString())
      }

      return this.current
    }
  }
})
