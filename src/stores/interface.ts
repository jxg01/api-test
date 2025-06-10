import { defineStore } from 'pinia'
import { projectApi, interfaceApi } from '@/api/'

// 类型定义
interface Project {
  id: number
  name: string
  base_url: string
  description: string
  creator: string
  created_at: string
  updated_at: string
}

interface TreeNode {
  id: number
  label: string
  type: 'node' | 'case'
  children?: TreeNode[]
  originData?: any
}

interface InterfaceTab {
  id: number | string
  label: string
  detail: {
    method: string
    path: string
    headers?: Record<string, string>
    params?: Record<string, unknown>
    module?: number | string
    name?: string
    id: number
  }
}

export const useInterfaceStore = defineStore('interface', {
  state: () => ({
    projects: [] as Project[],          // 项目列表
    selectedProjectId: null,        // 当前选中项目
    treeData: [] as TreeNode[],         // 树形数据
    tabs: [] as InterfaceTab[],         // 标签页列表
    activeTabId: null as number | string | null, // 当前激活的标签页ID
    searchText: '',                     // 搜索文本
    allLevelModules: [], // 所有模块数据
    envs: [] as { id: number, name: string, url: string }[], // 环境列表
  }),

  getters: {
    // 新增计算选中的完整项目信息
    selectedProject: (state) => {
      return state.projects.find(p => p.id === state.selectedProjectId) || null
    }
  },

  actions: {
    // 获取项目列表
    async fetchProjects() {
      try {
        const res = await projectApi.getProjectList({})
        this.projects = res.data
      } catch (error) {
        console.error('获取项目列表失败:', error)
        throw error
      }
    },

    async fetchAllLevelModules(project_id: number) {
      try {
        const res = await interfaceApi.getModuleAll({'project_id': project_id})
        this.allLevelModules = res.data
      } catch (error) {
        console.error('获取全部模块数据失败:', error)
      }
    },

    // 获取模块数据
    async fetchModules(projectId: number) {
      try {
        const res = await interfaceApi.getModuleList({ project_id: projectId })
        this.treeData = this.normalizeTree(res.data)
      } catch (error) {
        console.error('获取模块数据失败:', error)
      }
    },

    // 转换树形结构
    normalizeTree(data: any[]): TreeNode[] {
      return data.map(module => ({
        id: module.id,
        label: module.name,
        type: 'node',
        children: [
          ...(module.children ? this.normalizeTree(module.children) : []),
          ...(module.interface || []).map((intf: any) => ({
            id: intf.id,
            label: intf.name,
            type: 'case',
            originData: intf
          }))
        ]
      }))
    },

    // 添加标签页
    addTab(tab: InterfaceTab) {
      // 检查是否已存在
      const exists = this.tabs.some(t => t.id === tab.id)
      if (!exists) {
        this.tabs.push(tab)
      }
      this.activeTabId = tab.id
    },

    // 移除标签页
    removeTab(tabId: number | string) {
      this.tabs = this.tabs.filter(t => t.id !== tabId)
      if (this.tabs.length > 0) {
        this.activeTabId = this.tabs[0].id
      }
    },

    // 添加模块
    async addModule(data: any) {
      try {
        const res = await interfaceApi.createModule(data)
        const newModule: TreeNode = {
          id: res.id,
          label: res.name,
          type: 'node',
          children: []
        }
        this.fetchModules(this.selectedProjectId || 0)

      } catch (error) {
        console.error('添加模块失败:', error)
      }
    },

    // 删除模块
    async deleteModule(moduleId: number, type: 'node' | 'case') {
      try {
        const action = type === 'node'
        ? interfaceApi.deleteModule(moduleId)
        : interfaceApi.deleteInterface(moduleId)
        await action
        this.fetchModules(this.selectedProjectId || 0)
      } catch (error) {
        console.error('删除模块失败:', error)
      }
    },


    // 编辑节点名称（同步更新标签页）
    async renameNode(nodeId: number, newName: string, type: 'node' | 'case') {
      try {
        if (type === 'node') {
          const res = await interfaceApi.renameModule(nodeId, { name: newName })
          if (res.name) {
            // 更新树形数据
            const updateTree = (nodes: TreeNode[]): TreeNode[] => 
              nodes.map(node => {
                if (node.id === nodeId) {
                  node.label = newName
                } else if (node.children) {
                  node.children = updateTree(node.children)
                }
                return node
              })
            this.treeData = updateTree(this.treeData)
          }
        } else {
          const res = await interfaceApi.renameInterface(nodeId, { name: newName })
          if (res.name) {
            // 更新标签页名称
            this.tabs = this.tabs.map(tab => 
              tab.detail.id === nodeId ? { ...tab, label: newName, detail: {...tab.detail, name: newName} } : tab
            )
            if (this.selectedProjectId) {
              this.fetchModules(this.selectedProjectId)
            }
          }
        }
      } catch (error) {
        console.error('重命名失败:', error)
      }
    },

    async handleSaveInterface(localDetail: any) {
      try {
        if (!localDetail.name.trim()) {
          
          return '接口名称不能为空'
        }
        if (!localDetail.path.trim()) {
          return '接口路径不能为空'
        }
        const action = localDetail.id === -1 
        ? await interfaceApi.createInterface(localDetail)
        : await interfaceApi.updateInterface(localDetail.id, localDetail)
        
        const res = await action

        if (res) {
          // 更新树形数据
          this.fetchModules(this.selectedProjectId || 0)
          this.tabs = this.tabs.map(tab => {
            if (tab.detail.id === localDetail.id) {
              tab.detail = {
                id: res.id,
                name: res.name,
                path: res.path,
                method: res.method,
              }
              tab.label = res.name
              tab.id = res.id
            }
            return tab
          })
          this.activeTabId = res.id
        }
        return '接口已保存！'
      } catch (error) {
        console.log('保存接口失败:', error)
      }
    },
  }
})