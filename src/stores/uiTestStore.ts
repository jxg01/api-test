import { defineStore } from 'pinia'
import { uiTestApi, projectApi } from '@/api/'
import { useProjectStore } from '@/stores/project'
import { computed } from 'vue'

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


export const useUiTestStore = defineStore('uiTest', {
  state: () => ({
    uiPageList: [] as any [],
    uiElementList: [] as PageElement[],
    pageSelected: null as string | null,

  }),
  getters: {
    uiPageListData: (state) => {
      const pagesLabelList = []
      for (const page of state.uiPageList) {
        console.log('page => ', page)
        pagesLabelList.push({
          value: page,
          label: page
        })
      }
      console.log('pagesLabelList => ', pagesLabelList)
      return pagesLabelList
      // const projectStore = useProjectStore()
      // return projectStore.current?.id || null
    },
  },
  actions: {
    async fetchUiPage(project_id: number | string | null) {
      const res = await uiTestApi.getElementPageList({
        project_id: project_id,
      })
      if (res) {
        this.uiPageList = res.data.pages
        // this.uiPageList = computed(() => {
        //   return res.data.pages.map(page => ({
        //     label: page,
        //     value: page
        //   }))
        // })
        console.log('uiPageList in store => ', this.uiPageList)
      }
    },
    async fetchUiElementList(project_id: number | string | null, filterData: any = {}) {
      const res = await uiTestApi.getElementList({
        project_id: project_id,
        ...filterData
      })
      if (res) {
        this.uiElementList = res.data
      }
    },

    async addUiElement(data: PageElement) {
      const res = await uiTestApi.addElement(data)
      if (res) {
        this.uiElementList.push(res.data)
      }
    },


  },
})
