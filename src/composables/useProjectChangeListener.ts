import { onMounted, onUnmounted } from 'vue'
import { useProjectStore, projectEventBus, PROJECT_CHANGED_EVENT } from '@/stores/project'

/**
 * 项目切换监听器组合式函数
 * 用于在项目切换时自动刷新页面数据
 * 
 * @param refreshCallback 当项目切换时需要执行的刷新函数
 * @param immediate 是否在组件挂载时立即执行一次刷新
 * @param initialRefreshOnly 是否只在组件首次挂载时执行一次，而不监听项目切换事件
 * @returns 当前选中的项目ID
 */
export function useProjectChangeListener(
  refreshCallback: (newProjectId: number | string, oldProjectId?: number | string | null) => void | Promise<void>,
  immediate: boolean = true,
  initialRefreshOnly: boolean = false
) {
  const projectStore = useProjectStore()
  let unsubscribe: Function | null = null

  // 处理项目切换的函数
  const handleProjectChange = async (newProjectId: number | string, oldProjectId?: number | string | null) => {
    try {
      // 不再在这里单独调用ensureReady，让刷新回调函数自己处理
      // 调用传入的刷新回调函数
      await refreshCallback(newProjectId, oldProjectId)
    } catch (error) {
      console.error('Error refreshing data on project change:', error)
    }
  }

  onMounted(async () => {
    // 如果不是只执行一次初始化刷新，则订阅项目切换事件
    if (!initialRefreshOnly) {
      unsubscribe = projectEventBus.on(PROJECT_CHANGED_EVENT, handleProjectChange)
    }
    
    // 如果需要立即执行一次刷新
  if (immediate) {
    if (projectStore.currentProjectId) {
      await handleProjectChange(projectStore.currentProjectId)
    } else {
      // 没有项目ID时，设置轮询检查
      let checkCount = 0;
      const maxChecks = 10; // 最多检查10次
      
      const checkProjectId = setInterval(async () => {
        checkCount++;
        
        if (projectStore.currentProjectId) {
          clearInterval(checkProjectId);
          await handleProjectChange(projectStore.currentProjectId);
        } else if (checkCount >= maxChecks) {
          clearInterval(checkProjectId);
        }
      }, 500); // 每500ms检查一次
    }
  }
  })

  onUnmounted(() => {
    // 组件卸载时取消订阅，防止内存泄漏
    if (unsubscribe) {
      unsubscribe()
    }
  })

  // 返回当前选中的项目ID
  return projectStore.currentProjectId
}

/**
 * 简化版的项目切换监听器，用于仅在项目切换时执行特定操作
 * 不包含自动刷新逻辑
 */
export function useProjectSwitchHandler(
  handler: (newProjectId: number | string, oldProjectId?: number | string | null) => void
) {
  let unsubscribe: Function | null = null

  onMounted(() => {
    unsubscribe = projectEventBus.on(PROJECT_CHANGED_EVENT, handler)
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
}