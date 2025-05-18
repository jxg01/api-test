import { defineStore } from 'pinia'
import { testCaseApi } from '@/api/'

export interface TestCase {
  id: string
  name: string
  description: string
  status: number
  interface_name?: string
  updated_by?: string
  updated_at?: string
}

export interface EditTab {
  name: string
  title: string
  formData: TestCase
}

export const useCaseStore = defineStore('case', {
  state: () => ({
    cases: [] as TestCase[],
    editTabs: [] as EditTab[],
    currentPage: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    activeTab: 'list'
  }),

  getters: {
    paginatedCases: (state) => {
      const start = (state.currentPage - 1) * state.pageSize
      return state.cases.slice(start, start + state.pageSize)
    },
    tabs: (state) => [
      { name: 'list', title: '用例列表' },
      ...state.editTabs.map(t => ({ name: t.name, title: t.title }))
    ]
  },

  actions: {
    async fetchCaseList() {
      try {
        this.loading = true
        const res = await testCaseApi.getTestCaseList({
          page: this.currentPage,
          size: this.pageSize
        })
        this.cases = res.data
        this.total = res.meta.pagination.total
        this.currentPage = res.meta.pagination.page
      } catch (error) {
        console.error('获取用例列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    addNewCase() {
      const newCase: TestCase = {
        id: '',
        name: '新建用例',
        status: 0,
        description: ''
      }
      return this.editCase(newCase)
    },

    editCase(caseData: TestCase) {
      const existing = this.editTabs.find(tab => tab.formData.id === caseData.id)
      if (existing) {
        this.activeTab = existing.name
        return existing
      }

      const newTab: EditTab = {
        name: `edit_${Date.now()}`,
        title: caseData.name.length > 8 ? `${caseData.name.substring(0, 8)}...` : caseData.name,
        formData: { ...caseData }
      }
      this.editTabs.push(newTab)
      this.activeTab = newTab.name
      return newTab
    },

    async deleteCase(id: string) {
      try {
        await deleteCase(id)
        this.cases = this.cases.filter(c => c.id !== id)
        this.removeEditTabByCaseId(id)
      } catch (error) {
        console.error('删除用例失败:', error)
        throw error
      }
    },

    async saveCase(tab: EditTab) {
      try {
        const savedCase = tab.formData.id 
          ? await updateCase(tab.formData)
          : await createCase(tab.formData)
        
        const index = this.cases.findIndex(c => c.id === savedCase.id)
        if (index > -1) {
          this.cases.splice(index, 1, savedCase)
        } else {
          this.cases.unshift(savedCase)
        }
        this.updateTabTitle(tab.name, savedCase.name)
        return savedCase
      } catch (error) {
        console.error('保存用例失败:', error)
        throw error
      }
    },

    setCurrentPage(page: number) {
      this.currentPage = page
      this.fetchCaseList()
    },

    setPageSize(size: number) {
      this.pageSize = size
      this.currentPage = 1
      this.fetchCaseList()
    },

    setActiveTab(tabName: string) {
      this.activeTab = tabName
    },

    removeEditTab(tabName: string) {
      const index = this.editTabs.findIndex(t => t.name === tabName)
      if (index > -1) {
        this.editTabs.splice(index, 1)
        if (this.activeTab === tabName) {
          this.activeTab = 'list'
        }
      }
    },

    removeEditTabByCaseId(caseId: string) {
      this.editTabs = this.editTabs.filter(t => t.formData.id !== caseId)
    },

    closeAllTabs() {
      this.editTabs = []
      this.activeTab = 'list'
    },

    updateTabTitle(tabName: string, newName: string) {
      const tab = this.editTabs.find(t => t.name === tabName)
      if (tab) {
        tab.title = `${newName.substring(0, 8)}...`
      }
    },
    

  }
})