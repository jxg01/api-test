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
    searchText: ''                     // 搜索文本
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

    // 获取模块数据
    async fetchModules(projectId: number) {
      try {
        const res = await interfaceApi.getModuleList({ project_id: projectId })
        this.treeData = this.normalizeTree(res.data)
      } catch (error) {
        console.error('获取模块数据失败:', error)
        throw error
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
    addModule(module: TreeNode) {
      this.treeData.push(module)
    },

    // 更新模块
    updateModule(module: TreeNode) {
      const index = this.treeData.findIndex(m => m.id === module.id)
      if (index !== -1) {
        this.treeData[index] = module
      }
    },
    // 删除模块
    deleteModule(moduleId: number) {
      this.treeData = this.treeData.filter(m => m.id !== moduleId)
    },

    // 编辑节点名称（同步更新标签页）
    async renameNode(nodeId: number, newName: string, type: 'node' | 'case') {
      try {
        if (type === 'node') {
          const res = await interfaceApi.renameModule(nodeId, { name: newName })
          console.log('重命名模块:', res)
          if (res.name) {
            console.log('重命名模块成功:', res.name)
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
          console.log('重命名接口:', res)
          if (res.name) {
            console.log('重命名接口？？？？？？？:', res)
            // 更新标签页名称
            this.tabs = this.tabs.map(tab => 
              tab.detail.id === nodeId ? { ...tab, label: newName } : tab
            )
            if (this.selectedProjectId) {
              this.fetchModules(this.selectedProjectId)
            }
          }
        }
      } catch (error) {
        console.error('重命名失败:', error)
        // throw error
      }
    },

    // 添加接口
      // 添加接口（需关联模块）
    async addInterface(moduleId: number) {
      try {
        // 调用 API 创建接口
        const newInterface = await interfaceApi.createInterface({
          module_id: moduleId,
          name: '新建接口',
          method: 'GET',
          path: '/api/example'
        })

        // 更新树形数据
        const addCaseToTree = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === moduleId) {
              node.children = node.children || []
              node.children.push({
                id: newInterface.id,
                label: newInterface.name,
                type: 'case',
                originData: newInterface
              })
            } else if (node.children) {
              node.children = addCaseToTree(node.children)
            }
            return node
          })
        }

        this.treeData = addCaseToTree(this.treeData)

        // 自动打开新接口的标签页
        this.addTab({
          id: newInterface.id,
          label: newInterface.name,
          detail: {
            id: newInterface.id,
            method: newInterface.method,
            path: newInterface.path,
            headers: newInterface.headers || {},
            params: newInterface.params || {}
          }
        })
      } catch (error) {
        console.error('添加接口失败:', error)
        throw error
      }
  },

  
  
  
  
  
  
  }

    

})