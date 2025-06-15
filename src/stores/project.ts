import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '@/types/project'
import { projectApi } from '@/api'

const STORAGE_KEY = 'currentProjectId'

export const useProjectStore = defineStore('project', {
  state: () => ({
    current: null as Project | null,
    projectList: [] as Project[],
  }),

  getters: {
    // 获取当前项目 ID
    currentProjectId: (state) => {
      return state.current ? state.current.id : null
    },
  },

  actions: {
    setCurrent(project: Project) {
      this.current = project
      // ✅ 持久化当前项目 ID
      localStorage.setItem(STORAGE_KEY, project.id.toString())
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
      const list = await this.fetchProjectList()
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
