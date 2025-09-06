import { defineStore } from 'pinia'
import { projectApi, interfaceApi } from '@/api/'

// 类型定义
interface Project {
  id: number
  name: string
  base_url?: string
  description?: string
  creator?: string
  created_at?: string
  updated_at?: string
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
    id: number | string
  }
}

export const useInterfaceStore = defineStore('interface', {
  state: () => ({
    projects: [] as Project[],                              // 项目列表
    selectedProjectId: null as number | string | null,      // 当前选中项目
    treeData: [] as TreeNode[],                             // 树形数据（左侧）
    tabs: [] as InterfaceTab[],                             // 编辑标签页
    activeTabId: null as number | string | null,            // 当前激活标签
    searchText: '',                                         // 搜索文本
    allLevelModules: [] as any[],                           // 全层级模块数据（原始）
    envs: [] as { id: number, name: string, url?: string }[], // 环境配置
    selectedModuleId: null as number | string | null,       // 当前选中模块
  }),

  getters: {
    selectedProject: (state) => state.projects.find(p => p.id === state.selectedProjectId) || null
  },

  actions: {
    // 设置当前项目（同时持久化）
    setSelectedProject(projectId: number | string | null) {
      this.selectedProjectId = projectId
      try { localStorage.setItem('currentProjectId', String(projectId ?? '')) } catch (e) {}
    },

    // 获取项目列表
    async fetchProjects() {
      try {
        const res = await projectApi.getProjectList?.({})
        this.projects = res?.data ?? res ?? []
        return this.projects
      } catch (error) {
        console.error('fetchProjects error:', error)
        throw error
      }
    },

    // 获取全部层级模块（返回原始数据）
    async fetchAllLevelModules(projectId?: number | string | null) {
      const pid = projectId ?? this.selectedProjectId ?? localStorage.getItem('currentProjectId')
      if (!pid) return []
      try {
        const res = await interfaceApi.getModuleAll?.({ project_id: Number(pid) })
        this.allLevelModules = res?.data ?? res ?? []
        return this.allLevelModules
      } catch (error) {
        console.error('fetchAllLevelModules error:', error)
        this.allLevelModules = []
        return []
      }
    },

    // 获取模块列表并构造左侧树结构（兼容接口返回结构差异）
    async fetchModules(projectId?: number | string | null) {
      const pid = projectId ?? this.selectedProjectId ?? localStorage.getItem('currentProjectId')
      if (!pid) {
        this.treeData = []
        return []
      }
      try {
        const res = await interfaceApi.getModuleList?.({ project_id: Number(pid) })
        const data = res?.data ?? res ?? []
        this.treeData = this.normalizeTree(Array.isArray(data) ? data : [])
        return this.treeData
      } catch (error) {
        console.error('fetchModules error:', error)
        this.treeData = []
        return []
      }
    },

    // 与 fetchModules 相同的别名（有些页面使用 fetchModuleList）
    async fetchModuleList(projectId?: number | string | null) {
      return await this.fetchModules(projectId)
    },

    // 将后端模块+接口列表转换为树形结构
    normalizeTree(data: any[]): TreeNode[] {
      if (!Array.isArray(data)) return []
      return data.map(module => {
        const children: TreeNode[] = []
        // 递归子模块
        if (Array.isArray(module.children) && module.children.length) {
          children.push(...this.normalizeTree(module.children))
        }
        // 将 module.interface 或 module.interfaces 映射为 case 节点
        const interfaces = module.interface ?? module.interfaces ?? []
        if (Array.isArray(interfaces) && interfaces.length) {
          children.push(...interfaces.map((intf: any) => ({
            id: intf.id,
            label: intf.name ?? intf.title ?? String(intf.id),
            type: 'case' as const,
            originData: intf
          })))
        }
        return {
          id: module.id,
          label: module.name ?? module.title ?? String(module.id),
          type: 'node' as const,
          children
        }
      })
    },

    // 新增模块，创建后刷新模块树
    async addModule(data: any) {
      try {
        const res = await interfaceApi.createModule?.(data)
        // 刷新
        await this.fetchModules(data.project ?? this.selectedProjectId ?? localStorage.getItem('currentProjectId'))
        return res?.data ?? res
      } catch (error) {
        console.error('addModule error:', error)
        throw error
      }
    },

    // 删除模块或接口
    async deleteModule(moduleId: number | string, type: 'node' | 'case') {
      try {
        if (type === 'node') {
          await interfaceApi.deleteModule?.(Number(moduleId))
        } else {
          await interfaceApi.deleteInterface?.(Number(moduleId))
        }
        await this.fetchModules(this.selectedProjectId)
        return true
      } catch (error) {
        console.error('deleteModule error:', error)
        return false
      }
    },

    // 重命名模块或接口，成功后更新本地数据
    async renameNode(nodeId: number | string, newName: string, type: 'node' | 'case') {
      try {
        if (type === 'node') {
          const res = await interfaceApi.renameModule?.(Number(nodeId), { name: newName })
          if (res) {
            // 更新树本地显示
            const updateTree = (nodes: TreeNode[]): TreeNode[] =>
              nodes.map(node => {
                if (node.id === Number(nodeId)) node.label = newName
                else if (node.children) node.children = updateTree(node.children)
                return node
              })
            this.treeData = updateTree(this.treeData)
          }
          return res
        } else {
          const res = await interfaceApi.renameInterface?.(Number(nodeId), { name: newName })
          if (res) {
            // 更新 tabs 中名称并刷新树
            this.tabs = this.tabs.map(tab =>
              (tab.detail?.id === Number(nodeId)) ? { ...tab, label: newName, detail: { ...tab.detail, name: newName } } : tab
            )
            await this.fetchModules(this.selectedProjectId)
          }
          return res
        }
      } catch (error) {
        console.error('renameNode error:', error)
        throw error
      }
    },

    // 保存或更新接口（localDetail.id === -1 或不存在则创建）
    async handleSaveInterface(localDetail: any) {
      try {
        if (!localDetail || !String(localDetail.name ?? '').trim()) {
          return { success: false, message: '接口名称不能为空' }
        }
        if (!String(localDetail.path ?? '').trim()) {
          return { success: false, message: '接口路径不能为空' }
        }

        let res: any = null
        if (!localDetail.id || localDetail.id === -1) {
          res = await interfaceApi.createInterface?.(localDetail)
        } else {
          res = await interfaceApi.updateInterface?.(Number(localDetail.id), localDetail)
        }
        const data = res?.data ?? res
        if (data) {
          // 刷新树与标签页状态
          await this.fetchModules(this.selectedProjectId)
          this.tabs = this.tabs.map(tab => {
            if (tab.detail?.id === Number(localDetail.id)) {
              return {
                ...tab,
                label: data.name ?? tab.label,
                detail: { ...tab.detail, id: data.id ?? tab.detail.id, name: data.name ?? tab.detail.name, path: data.path ?? tab.detail.path, method: data.method ?? tab.detail.method }
              }
            }
            return tab
          })
          this.activeTabId = data.id ?? this.activeTabId
        }
        return { success: true, data }
      } catch (error) {
        console.error('handleSaveInterface error:', error)
        return { success: false, message: '保存失败' }
      }
    },

    // 添加标签页（防重复）
    addTab(tab: InterfaceTab) {
      const exists = this.tabs.some(t => t.id === tab.id)
      if (!exists) this.tabs.push(tab)
      this.activeTabId = tab.id
    },

    // 移除标签页
    removeTab(tabId: number | string) {
      this.tabs = this.tabs.filter(t => t.id !== tabId)
      if (!this.tabs.length) this.activeTabId = null
      else this.activeTabId = this.tabs[0].id
    },

    // 简易接口列表加载（供右侧表格使用，兼容多种后端实现）
    async fetchInterfaceList(projectId?: number | string | null, page = 1, size = 20, params: any = {}) {
      const pid = projectId ?? this.selectedProjectId ?? localStorage.getItem('currentProjectId')
      if (!pid) return { list: [], total: 0 }
      try {
        const res = await interfaceApi.getInterfaceList?.({ project_id: Number(pid), page, size, ...params })
        const data = res?.data ?? res ?? {}
        return { list: data.list ?? data, total: data.total ?? (Array.isArray(data) ? data.length : 0) }
      } catch (error) {
        console.error('fetchInterfaceList error:', error)
        return { list: [], total: 0 }
      }
    }
  }
})