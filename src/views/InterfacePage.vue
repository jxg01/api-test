<template>
  <div class="interface-container">
    <!-- 左侧面板 -->
    <div class="left-panel">
      <ProjectSelector />
      <InterfaceTree />
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <InterfaceTabs />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted, getCurrentInstance } from 'vue'
import { useInterfaceStore } from '@/stores/interface'
import ProjectSelector from '@/components/interface/ProjectSelector.vue'
import InterfaceTree from '@/components/interface/InterfaceTree.vue'
import InterfaceTabs from '@/components/interface/InterfaceTabs.vue'
import { useProjectStore } from '@/stores/project'
import { useProjectChangeListener } from '@/composables/useProjectChangeListener'
import { useGlobalRouteStateClearer } from '@/composables/useGlobalRouteStateClearer'

const interfaceStore = useInterfaceStore()
const projectStore = useProjectStore()

// 使用全局路由状态清除器，确保离开页面时清除搜索条件和分页状态
useGlobalRouteStateClearer('interface')

// 页面筛选与分页状态（可根据实际页面扩展）
const filters = reactive<{ keyword?: string; method?: string; moduleId?: number | null }>({
  keyword: '', method: '', moduleId: null
})
const pager = reactive({ page: 1, size: 20 })

// 统一刷新：根据 projectId 拉左侧模块树和右侧接口列表
async function reloadAll(projectId: number | string | null) {
  // 先清空视图，避免残留数据
  try { interfaceStore.treeData = [] } catch (e) { /* ignore */ }

  if (!projectId) {
    return
  }

  try {
    // 优先调用会直接写入 treeData 的方法
    if (typeof interfaceStore.fetchModules === 'function') {
      await interfaceStore.fetchModules(Number(projectId))
    } else if (typeof interfaceStore.fetchModuleList === 'function') {
      await interfaceStore.fetchModuleList(Number(projectId))
    } else if (typeof interfaceStore.fetchAllLevelModules === 'function') {
      // 若只有全层级接口，将其转换为 treeData（若 store 提供 normalizeTree 则复用）
      await interfaceStore.fetchAllLevelModules(Number(projectId))
      if (typeof (interfaceStore as any).normalizeTree === 'function') {
        try {
          interfaceStore.treeData = (interfaceStore as any).normalizeTree((interfaceStore as any).allLevelModules || [])
        } catch (e) {
          // fallback: assign raw
          interfaceStore.treeData = (interfaceStore as any).allLevelModules || []
        }
      } else {
        interfaceStore.treeData = (interfaceStore as any).allLevelModules || []
      }
    }

    // 右侧：拉取接口列表（根据 store 实现选择合适方法）
    // if (typeof interfaceStore.fetchInterfaceList === 'function') {
    //   await interfaceStore.fetchInterfaceList(Number(projectId), pager.page, pager.size, { ...filters })
    // } else if (typeof interfaceStore.fetchList === 'function') {
    //   await interfaceStore.fetchList(Number(projectId), pager.page, pager.size, { ...filters })
    // }
  } catch (e) {
    console.error('reloadAll error:', e)
  }
}

function resetViewStateOnProjectChange() {
  filters.keyword = ''
  filters.method = ''
  filters.moduleId = null
  pager.page = 1
  // 关闭所有标签页
  interfaceStore.tabs = []
  interfaceStore.activeTabId = null
}

// 初始化数据加载函数，包含重试逻辑
const initDataWithRetry = async (projectId: number | string) => {
  if (!projectId) return;
  
  try {
    await reloadAll(projectId);
  } catch (error) {
    console.error('InterfacePage: 首次加载数据失败，将重试:', error);
    // 首次加载失败，尝试重试一次
    setTimeout(async () => {
      if (projectStore.currentProjectId) {
        try {
          await reloadAll(projectStore.currentProjectId);
        } catch (retryError) {
          console.error('InterfacePage: 重试加载数据也失败:', retryError);
        }
      }
    }, 500);
  }
}

// 使用自定义的项目切换监听器组合式函数，并整合初始化逻辑
useProjectChangeListener(async (newProjectId: number | string) => {
  resetViewStateOnProjectChange()
  await initDataWithRetry(newProjectId)
}, true, false)

// 保持简单的onMounted，不再重复调用ensureReady和加载数据
onMounted(() => {
  console.log('InterfacePage: 组件已挂载，数据加载由useProjectChangeListener处理');
  // 不再在这里进行重复初始化，避免多次调用project接口
  // 所有初始化逻辑已整合到useProjectChangeListener中
})
</script>

<style scoped>
.interface-container {
  display: flex;
  overflow: hidden;
}
.left-panel {
  width: 400px;;
  border-right: 1px solid var(--el-border-color);ight: 1px solid var(--el-border-color);
  display: flex;;
  flex-direction: column; flex-direction: column;
  height: 100%;
}
.right-panel {
  flex: 1;
  min-width: 0;
}
</style>