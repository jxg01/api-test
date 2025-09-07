import { onBeforeRouteLeave } from 'vue-router'
import { useCaseStore } from '@/stores/testcase'
import { useInterfaceStore } from '@/stores/interface'
import { useProjectStore } from '@/stores/project'

/**
 * 全局路由状态清除器组合式函数
 * 用于在路由离开时清除对应页面的store状态
 * @param pageType 页面类型，用于确定要清除哪些状态
 */
export function useGlobalRouteStateClearer(pageType: 'testcase' | 'interface' | 'suite' | 'task' | string) {
  // 路由离开时清除页面状态
  onBeforeRouteLeave((to, from) => {
    // 判断是否需要清除状态（只有当离开当前页面到其他页面时才清除）
    if (from.path !== to.path) {
      // 根据页面类型清除对应的状态
      switch (pageType) {
        case 'testcase':
          const caseStore = useCaseStore()
          // 清除测试用例页面的搜索条件和分页状态
          caseStore.searchInput = ''
          caseStore.searchInterfaceId = ''
          caseStore.currentPage = 1
          break
          
        case 'interface':
          const interfaceStore = useInterfaceStore()
          // 清除接口页面的搜索条件
          if (interfaceStore.searchText !== undefined) {
            interfaceStore.searchText = ''
          }
          // 关闭所有标签页并重置活动标签
          interfaceStore.tabs = []
          interfaceStore.activeTabId = null
          break
          
        case 'suite':
          // 如果有测试套件相关的store，可以在这里清除
          break
          
        case 'task':
          // 如果有任务相关的store，可以在这里清除
          break
          
        default:
          // 其他页面类型的处理
          break
      }
      
      console.log(`已清除${pageType}页面的状态`)
    }
  })
}