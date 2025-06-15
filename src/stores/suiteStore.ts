import { defineStore } from 'pinia'
import { suiteApi, testCaseApi, projectApi } from '@/api/'
import { useInterfaceStore } from './interface'

export interface Suite {
  id?: number | string
  name: string
  description: string
  execution_status: string
  cases: number[]
  project?: string | number
}

export interface TestCase {
  id: number
  name: string
}

export interface Envs {
  id: number
  name: string
  url: string
}

export const useSuiteStore = defineStore('suite', {
  state: () => ({
    testSuites: [] as Suite[],
    allCases: [] as TestCase[],
    casesRelatedProject: [] as TestCase[],
    currentSuite: null as Suite | null,
    formVisible: false,
    // projectEnvs: [] as Envs[],
    projectEnvsSelect: '',
    projectList: [] as { id: number, name: string }[],
    currentPage: 1,
    pageSize: 20,
    total: 0,
    searchSuiteName: '', 
    localProjectId: 0,
  }),

  actions: {
    async fetchProjectList() {
      try {
        const res = await projectApi.getProjectList({})
        this.projectList = res.data
      } catch (error) {
        console.error('获取项目列表失败', error)
      }
    },


    async fetchSuites() {
      try {
        const res = await suiteApi.getSuiteList({
          project: this.localProjectId,
          name: this.searchSuiteName,
          page: this.currentPage,
          size: this.pageSize
        })
        this.testSuites = res.data
        this.total = res.meta.pagination.total
        this.currentPage = res.meta.pagination.page
      } catch (error) {
        console.error('获取套件失败', error)
      }
    },

    async fetchCases(projectId: number | string | null) {
      try {
        const res = await testCaseApi.getTestCaseSimpleList({ 'project_id': projectId })
        if (projectId) {
          this.casesRelatedProject = res.data
        } else {
          this.allCases = res.data
        }
      } catch (error) {
        console.error('获取用例失败', error)
      }
    },

    setCurrentSuite(suite: Suite | null) {
      this.currentSuite = suite ? { ...suite } : null
    },

    async saveSuite(suite: Suite) {
      try {
        const action = suite.id
        ? await suiteApi.updateSuite(Number(suite.id), suite)
        : await suiteApi.createSuite(suite)

        const res = await action

        await this.fetchSuites()
        return res
      } catch (error) {
        console.error('保存套件失败', error)
      }
    },

    async removeSuite(id: number) {
      try {
        await suiteApi.deleteSuite(id)
        await this.fetchSuites()
      } catch (error) {
        console.error('删除套件失败', error)
      }
    },

    async runSuite(id: number, env_url: string) {
      try {
        const res = await suiteApi.runSuite(id, {
          env_url: env_url,
        })
        await this.fetchSuites()
        if (res) { return res }
        
      } catch (error) {
        console.error('运行套件失败', error)
      }
    },

    async fetchSuiteDetailExecutionHistory(id: number) {
      try {
        const res = await suiteApi.getSuiteExecutionHistory({ 'suite': id })
        return res
      } catch (error) {
        console.error('获取套件执行记录失败', error)
      }
    },

    // async fetchEnvs(id: number | string) {
    //   try {
    //     const res = await projectApi.getProjectEnvList({'project_id': id})
    //     this.projectEnvs = res.data
    //   } catch (error) {
    //     console.error('运行套件失败', error)
    //   }
    // },
    setCurrentPage(page: number) {
      this.currentPage = page
      this.fetchSuites()
    },

    setPageSize(size: number) {
      this.pageSize = size
      this.currentPage = 1
      this.fetchSuites()
    },



  },
})
