import { defineStore } from 'pinia'
import { uiTestApi } from '@/api/'
import { useProjectStore } from '@/stores/project'

export interface PageElement {
  id: number
  name: string
  locator_value: string
  locator_type: 'css' | 'xpath' | 'text' | 'id' | 'class' | 'test-id' // 定位方式
  description: string
  page: string  // 所属页面路径
  created_by?: string
  updated_at?: string
  created_at?: string
  updated_by?: string
  project?: number | string | null // 所属项目ID
}


export interface CaseData {
  id: string
  name: string
  description: string
  pre_apis: []
  steps: Step[]
  post_steps: []
  enable: boolean
  module: number
}


export interface TestCaseModule {
  id: number
  name: string
  cases: CaseData []
  created_by?: string
  updated_at?: string
  created_at?: string
  updated_by?: string
  project?: number | string | null // 所属项目ID
}

export interface Step {
  action: string,
  url?: string,
  selector?: string,
  header?: string,
  expect?: string
}



export const useUiTestStore = defineStore('uiTest', {
  state: () => ({
    uiPageList: [] as any [],
    uiElementList: [] as PageElement[],
    pageSelected: null as string | null,
    total: 0,
    pageSize: 20,
    currentPage: 1,
    filterParams: {
      locator_type: '',
      name: '',
    },
    moduleList: [] as TestCaseModule[]

  }),
  actions: {
    async fetchUiPage(project_id: number | string | null) {
      const res = await uiTestApi.getElementPageList({
        project_id: project_id,
      })
      if (res) {
        this.uiPageList = res.data.pages
      }
    },
    async fetchUiElementList(projectId?: number | string | null) {
      const res = await uiTestApi.getElementList({
        project_id: projectId || useProjectStore().currentProjectId,
        page: this.currentPage,
        size: this.pageSize,
        ...this.filterParams
      })
      if (res) {
        this.uiElementList = res.data
        this.total = res.meta.pagination.total
        this.currentPage = res.meta.pagination.page
      }
    },

    // 分页处理
    async handlePageChange(page: number) {
      this.currentPage = page
      this.fetchUiElementList()
    },

    async handleSizeChange(size: number) {
      console.log('handleSizeChange', size)
      this.pageSize = size
      this.currentPage = 1
      this.fetchUiElementList()
    },

    async addUiElement(data: PageElement) {
      try {
        const res = await uiTestApi.addElement(data)
        if (res) {
          this.uiElementList.push(res.data)
          return res
        }
      } catch (error) {
        console.error('Error adding UI element:', error)
      }
      
    },

    async updateUiElement(data: PageElement) {
      try {
        const res = await uiTestApi.updateElement(data.id, data)
        if (res) {
          return res
        }
      } catch (error) {
        console.error('Error updating UI element:', error)
      }
    },

    async deleteUiElement(id: number | string) {
      try {
        await uiTestApi.deleteElement(id)
      } catch (error) {
        console.error('Error deleting UI element:', error)
      }
    },

    async fetchModuleList(projectId?: number | string | null) {
      const res = await uiTestApi.getModuleList({
        project_id: projectId || useProjectStore().currentProjectId,

      })
      if (res) {
        this.moduleList = res.data

      }
    },


  },
})
