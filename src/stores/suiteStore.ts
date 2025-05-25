import { defineStore } from 'pinia'
import { suiteApi, testCaseApi, projectApi } from '@/api/'

export interface Suite {
  id?: number | string
  name: string
  description: string
  execution_status: string
  cases: number[]
  project: number | string
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
    currentSuite: null as Suite | null,
    formVisible: false,
    projectEnvs: [] as Envs[],
    projectEnvsSelect: '',

  }),

  actions: {
    async fetchSuites() {
      try {
        const res = await suiteApi.getSuiteList({})
        this.testSuites = res.data
      } catch (error) {
        console.error('获取套件失败', error)
      }
    },

    async fetchCases() {
      try {
        const res = await testCaseApi.getTestCaseSimpleList()
        this.allCases = res.data
      } catch (error) {
        console.error('获取用例失败', error)
      }
    },

    setCurrentSuite(suite: Suite | null) {
      this.currentSuite = suite ? { ...suite } : null
    },

    async saveSuite(suite: Suite) {
      try {
        if (suite.id) {
          await updateSuite(suite.id, suite)
        } else {
          await createSuite(suite)
        }
        await this.fetchSuites()
      } catch (error) {
        console.error('保存套件失败', error)
      }
    },

    async removeSuite(id: number) {
      try {
        await deleteSuiteById(id)
        await this.fetchSuites()
      } catch (error) {
        console.error('删除套件失败', error)
      }
    },

    async runSuite(id: number) {
      try {
        await runSuiteById(id)
        await this.fetchSuites()
      } catch (error) {
        console.error('运行套件失败', error)
      }
    },

    async fetchEnvs(id: number | string) {
      try {
        const res = await projectApi.getProjectEnvList({'project_id': id})
        this.projectEnvs = res.data
      } catch (error) {
        console.error('运行套件失败', error)
      }
    }
  },
})
