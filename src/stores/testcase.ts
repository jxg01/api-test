import { defineStore } from 'pinia'
import { testCaseApi, interfaceApi, projectApi } from '@/api/'
import { useInterfaceStore } from '@/stores/interface'
import { ta } from 'element-plus/es/locale'

export interface TestCase {
  id: number | string
  name: string
  enabled: boolean
  description: string
  headers:  Record<string, string>
  params:  Record<string, string>
  body_type: string // 'form' | 'json' | 'raw'
  data: Record<string, string> // 用于存储表单数据
  body:  string
  assertions: [Record<string, string>]
  variable_extract: [Record<string, string>]
  project?: number | string // 项目ID
  interface?: number | string // 接口ID
}

export interface EditTab {
  name: string
  title: string
  formData: TestCase
}

export interface ApiList {
  id: number
  name: string
}

export interface Envs {
  id: number
  name: string
  url: string
}

export interface responseDataType {
  status_code: number
  headers: Record<string, string>
  body: any
}

export interface requestDataType {
  url: string
  method: string
  headers: Record<string, string>
  data: Record<string, string>
  json: Record<string, string>
}

export interface testCaseHistory {
  id: number
  case: number
  status: string
  request_data: requestDataType
  response_data: responseDataType
  assertions_result: []
  extracted_vars: object
  duration: number
  created_at: Date
  executed_by: string
}

export const useCaseStore = defineStore('case', {
  state: () => ({
    cases: [] as TestCase[],
    editTabs: [] as EditTab[],
    currentPage: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    activeTab: 'list',
    searchInput: '',
    searchSelectProjectId: '',
    searchInterfaceId: '',
    interFaceList: [] as ApiList[],
    caseDetailInterId: '',
    caseDetailProjectId: '',
    apiStoreInstance: useInterfaceStore(),
    projectEnvs: [] as Envs[],
    projectEnvsSelect: '',
    caseHistoryList: [] as testCaseHistory[],
  }),

  getters: {
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
          size: this.pageSize,
          name: this.searchInput,
          project_id: this.searchSelectProjectId,
          interface_id: this.searchInterfaceId,
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
        id: 0,
        name: '新建用例',
        enabled: true,
        description: '',
        headers: {},
        params: {},
        body: {},
        assertions: [{}],
        variable_extract: [{}],
      }
      return this.editCase(newCase)
    },

    // 编辑 添加 都使用这个方法
    editCase(caseData: TestCase) {
      console.log('caseData', caseData)
      const tabName = caseData.id
      // const tabName = caseData.id 
      // ? `edit_${caseData.id}`
      // : `edit_new_${Date.now()}`;
      console.log('tabName', tabName)
      console.log('this.editTabs', this.editTabs)
      const existing = this.editTabs.find(tab => tab.name === tabName);
      console.log('existing', existing)
      if (existing) {
        this.activeTab = existing.name
        return existing
      }

      const newTab: EditTab = {
        name: tabName,
        title: caseData.name.length > 8 ? `${caseData.name.substring(0, 8)}...` : caseData.name,
        formData: { ...caseData }
      }
      this.editTabs.push(newTab)
      this.activeTab = newTab.name
      return newTab
    },

    async deleteCase(id: number) {
      try {
        await testCaseApi.deleteTestCase(id)
        this.cases = this.cases.filter(c => c.id !== id)
        this.removeEditTabByCaseId(id)
      } catch (error) {
        console.error('删除用例失败:', error)
      }
    },

    async saveCase(tab: EditTab) {
      try {
        if (tab.formData.id) { delete tab.formData.interface}
        const savedCase = tab.formData.id 
          ? await testCaseApi.updateTestCase(Number(tab.formData.id), tab.formData)
          : await testCaseApi.createTestCase({
            ...tab.formData,
            'interface': tab.formData.interface
          })
          // 更新cases列表
          const index = this.cases.findIndex(c => c.id === savedCase.id);
          if (index > -1) {
            this.cases.splice(index, 1, savedCase);
          } else {
            this.cases.unshift(savedCase);
          }
          // 精准定位要更新的标签页
          const targetIndex = this.editTabs.findIndex(t => t.name === tab.name);
          if (targetIndex > -1) {
            // 更新标签页信息
            this.editTabs[targetIndex] = {
              ...this.editTabs[targetIndex],
              name: savedCase.id,  // 使用ID作为唯一标识
              title: this.getTabTitle(savedCase.name),
              formData: { ...savedCase }
            };
            
            // 如果当前激活的是这个标签页，同步更新activeTab
            if (this.activeTab === tab.name) {
              // this.activeTab = `edit_${savedCase.id}`;
              this.activeTab = savedCase.id;
            }
          }
          this.fetchCaseList()
          return savedCase;
      } catch (error) {
        console.error('保存用例失败:', error)
        throw error
      }
    },

    getTabTitle(name: string): string {
      return name.length > 8 ? `${name.substring(0, 8)}...` : name;
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
      this.fetchCaseList();
    },

    removeEditTabByCaseId(caseId: number) {
      this.editTabs = this.editTabs.filter(t => t.formData.id !== caseId)
    },

    closeAllTabs() {
      if (this.editTabs.length !== 0) {
        this.editTabs = []
        this.activeTab = 'list'
        this.fetchCaseList();
      }
    },

    updateTabTitle(tabName: string, newName: string) {
      const tab = this.editTabs.find(t => t.name === tabName)
      if (tab) {
        tab.title = `${newName.substring(0, 8)}...`
      }
    },

    // 项目切换处理
    async handleProjectChange(projectId: number){
      // 获取当前项目的模块数据 
      try {
        const res = await interfaceApi.getInterfaceList({'project_id': projectId})
        if (res) {
          this.interFaceList = res.data
        }
        this.searchInterfaceId = ''
      } catch (error) {
        console.error('in project change => ', error)
      }
    },

    async fetchEnvs(id?: number | string) {
      try {
        const res = await projectApi.getProjectEnvList({'project_id': id})
        this.projectEnvs = res.data
      } catch (error) {
        console.error('运行套件失败', error)
      }
    },

    async runTestcase(caseID: number, envUrl: string){
      try {
        const res = await testCaseApi.runTestCase(caseID, {'env_url': envUrl})
        return res
      } catch (error) {
        console.error('运行套件失败', error)
      }
    },

    async fetchTestCaseHistory(id: number) {
      try {
        const res = await testCaseApi.getTestCaseExecuteHistory(id)
        this.caseHistoryList = res.data
      } catch (error) {
        console.error('获取套件失败', error)
      }
    },

    // // 添加用例 关联 接口 的列表
    // async getAllInterFace(){
    //   // 获取当前项目的模块数据 
    //   try {
    //     const res = await interfaceApi.getInterfaceList({'project_id': projectId})
    //     if (res) {
    //       this.interFaceList = res.data
    //     }
    //     this.searchInterfaceId = ''
    //   } catch (error) {
    //     console.error('in project change => ', error)
    //   }
    // },

  }
})
