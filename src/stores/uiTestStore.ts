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
  module?: number
  login_case?: string | null | undefined
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

// 树节点类型
export interface CaseTreeNode {
  id: string | number
  label: string
  type: 'group' | 'case'
  children?: CaseTreeNode[]
  caseData?: CaseData  // 仅type=case时有
}

export interface simpleElementType {
  id: number
  name: string
  locator_type: string
  locator_value: string
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
    moduleList: [] as CaseTreeNode[],
    simpleElementList: [] as simpleElementType[],
  }),
  actions: {
    async fetchSimpleUiElementList(project_id?: number | string | null) {
      const res = await uiTestApi.getSimpleElementPageList({
        project_id: useProjectStore().currentProjectId,
      })
      if (res) {
        this.simpleElementList = res.data
        return res.data
      }
    },


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
        this.moduleList = this.transformModuleDataToTree(res.data)
        console.log('this.moduleList === ', this.moduleList)
      }
    },

    // 转换接口数据为tree结构
    transformModuleDataToTree(data: any[]): CaseTreeNode[] {
      return data.map(module => ({
        // id: `group-${module.id}`,
        id: module.id,
        label: module.name,
        type: 'group',
        children: module.cases.map((caseItem: any) => ({
          // id: `case-${caseItem.id}`,
          id: caseItem.id,
          label: caseItem.name,
          type: 'case',
          caseData: {
            // id: `case-${caseItem.id}`,
            id: caseItem.id,
            name: caseItem.name,
            description: caseItem.description,
            pre_apis: caseItem.pre_apis || [],
            steps: caseItem.steps || [],
            post_steps: caseItem.post_steps || [],
            enable: caseItem.enable,
            login_case: caseItem.login_case,
          }
        }))
      }))
    },

    async createUiModule(moduleName: {name: string}) {
      const res = await uiTestApi.createUiModule({
        project: useProjectStore().currentProjectId,
        ...moduleName
      })
      if (res) {
        return res
      }
    },

    async deleteUiModule(moduleId: number) {
      console.log('idididid',  moduleId)
      await uiTestApi.deleteUiModule(moduleId)
      await this.fetchModuleList()
    },

    async createUiTestCase(caseData: any) {
      const res = await uiTestApi.addUiTestCase(caseData)
      if (res) {
        return res
      }
    },

    async editUiTestCase(caseData: any) {
      const res = await uiTestApi.updateUiTestCase(caseData.id, caseData)
      if (res) {
        return res
      }
    },

    async deleteUiTestCase(caseId: number | string) {
      await uiTestApi.deleteUiTestCase(caseId)
      await this.fetchModuleList()
    },

    async runUiTestCase(caseId: number) {
      const res = await uiTestApi.runUiTestCase(caseId)
      if (res) {
        return res
      }
    },

    async fetchTestFileList() {
      const res = await uiTestApi.getFilesList()
      if (res) {
        return res.data
      }
    },


  },
})
