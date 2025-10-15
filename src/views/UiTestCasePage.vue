<template>
  <div class="ui-test-case-container">
    <el-row class="main-content-row">
      <!-- 左侧树结构 -->
      <el-col :span="6" class="tree-container">
        <div class="tree-header">
          <el-button type="primary" :icon="Plus" @click="openAddDialog" class="add-group-btn">新建分组</el-button>
          <el-button type="success" :icon="VideoPlay" @click="openBatchRunDialog" class="batch-run-btn">批量执行</el-button>
        </div>
        <el-input
          v-model="searchText"
          placeholder="输入分组名称或用例名称搜索"
          clearable
          size="large"
          class="search-input"
        />
        <el-tree
          ref="treeRef"
          :data="store.moduleList"
          node-key="id"
          :props="{ label: 'label', children: 'children' }"
          @node-click="onTreeNodeClick"
          highlight-current
          class="case-tree"
          default-expand-all
          :filter-node-method="filterNode"
          @tab-remove="closeTab"
          show-checkbox
          @check-change="onCheckChange"
          draggable
          :allow-drop="allowDrop"
          @node-drop="handleNodeDrop"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon
                :class="data.type"
                :data-type="data.type"
                :style="{ color: data.type === 'case' ? (data.caseData?.enable === false ? '#f56c6c' : '#67c23a') : undefined }"
              >
                <component :is="data.type === 'case' ? 'Document' : 'Folder'" />
              </el-icon>
              <div class="tree-node-content">
                <template v-if="data.type === 'group' && isEditing && editingNodeId === data.id">
                  <el-input 
                    ref="nameInput"
                    v-model="newLabel"
                    size="small"
                    @blur="handleSave"
                    @keyup.enter="handleSave"
                    @keydown.esc="cancelEdit"
                    :maxlength="50"
                    @click.stop
                    style="width: 150px; margin-right: 10px;"
                  />
                </template>
                <template v-else>
                  <span class="tree-node-label">{{ data.label }}</span>
                  <el-dropdown trigger="click">
                    <el-icon class="more-btn" @click.stop><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <template v-if="data.type === 'case'">
                          <el-dropdown-item @click.stop="copyCase(data)">复制</el-dropdown-item>
                          <el-dropdown-item @click.stop="deleteCase(data)" danger>删除</el-dropdown-item>
                        </template>
                        <template v-else>
                          <el-dropdown-item @click.stop="addCase(data)">新建用例</el-dropdown-item>
                          <el-dropdown-item @click.stop="addSubModule(data)">新建子模块</el-dropdown-item>
                          <el-dropdown-item @click.stop="renameModule(data)">重命名</el-dropdown-item>
                          <el-dropdown-item @click.stop="deleteModule(data)" danger>删除</el-dropdown-item>
                        </template>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </div>
            </div>
          </template>
        </el-tree>
      </el-col>

      <!-- 右侧Tab页和编辑区 -->
      <el-col :span="18" class="editor-container">
        <div class="editor-header">
          <el-button type="danger" size="small" @click="closeAllTabs" class="close-all-btn">关闭全部Tab</el-button>
        </div>
        <el-tabs
        v-model="activeTab"
        type="card"
        closable
        @tab-remove="closeTab"
        class="case-tabs"
      >
        <el-tab-pane
          v-for="tab in openTabs"
          :key="tab.id"
          :label="tab.name"
          :name="tab.id"
        >
          <CaseEditor
            v-model:caseData="tab.caseData"
            :default-edit-mode="tab.editable"
            @save="saveCase(tab)"
            @run="runCase(tab)"
            @cancel="handleCaseCancel(tab)"
            ref="caseEditorRefs"
          />
        </el-tab-pane>
      </el-tabs>
        <div v-if="openTabs.length === 0" class="empty-state">← 点击左侧用例树节点编辑</div>
      </el-col>
    </el-row>
    <base-dialog
        ref="dialogRef"
        :fields="moduleDialogFormFields"
        :rules="formRules"
        title="分组"
        @submit="handleSubmit"
        @click.stop
      
      ></base-dialog>

      <el-dialog v-model="browserDialog.visible" title="选择运行配置" width="400px">
        <el-form :model="browserDialog.form">
          <!-- 浏览器类型 -->
          <el-form-item label="浏览器类型">
            <el-select v-model="browserDialog.form.browser_type" placeholder="请选择浏览器类型" clearable>
              <el-option label="Chrome" value="chromium" />
              <el-option label="Firefox" value="firefox" />
              <el-option label="Safari" value="webkit" />
            </el-select>
          </el-form-item>

          <!-- 是否无头模式 -->
          <el-form-item label="无头模式">
            <el-switch v-model="browserDialog.form.headless" />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="browserDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchRunTestCases">确认</el-button>
        </template>
      </el-dialog>

      <!-- 执行过程弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="`执行进度：${status} ${progress.finished}/${progress.total}`"
        width="80%"
        top="5vh"
        @close="onDialogClose"
      >
        <div style="display:flex; gap:16px; align-items:flex-start;">
          <!-- 左侧：截图流 -->
          <div style="flex:2; max-height:70vh; overflow:auto;">
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
              <el-image
                v-for="(src, i) in images"
                :key="i + src"
                :src="src"
                :preview-src-list="images"
                :initial-index="i"
                style="width:100%; border-radius:8px; border:1px solid #eee; cursor: pointer;"
                loading="lazy"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div v-if="images.length === 0" style="color:#999; padding:12px;">
              等待首帧截图...
            </div>
          </div>
        </div>

        <template #footer>
          <el-button @click="dialogVisible=false">关闭</el-button>
        </template>
      </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive , watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import CaseEditor from '@/components/UiTest/CaseEditor.vue'
import { Plus, VideoPlay, MoreFilled } from '@element-plus/icons-vue'
import { useUiTestStore, CaseTreeNode, CaseData } from '@/stores/uiTestStore'
import BaseDialog from '@/components/BaseDialog.vue'
import { uiTestApi } from '@/api'
import { useProjectStore } from '@/stores/project'
import { useProjectChangeListener } from '@/composables/useProjectChangeListener'
import { useRunLive } from '@/composables/useRunLive'

const store = useUiTestStore()
const projectStore = useProjectStore()
const caseEditorRefs = ref<Record<string, any>>({})
// 编辑状态变量
const isEditing = ref(false)
const editingNodeId = ref('')
const newLabel = ref('')
const nameInput = ref()




// 弹窗控制
const dialogVisible = ref(false)
const currentRunId = ref<string | null>(null)

// 订阅器
const { connect, disconnect, images, logs, status, progress } = useRunLive()

// 你的原方法包装一下
async function runCase(tab: Tab) {
  try {
    // const tab = getCurrentTab() // 如果你有当前 tab 的方法；否则按你的上下文拿 tab
    if (!tab?.id) {
      ElMessage.error('用例未保存')
      return
    }
    // 调后端提交运行 —— 期望返回 { run_id: '...' }
    const r = await store.runUiTestCase(Number(tab.id))
    // 兼容后端返回结构：若 r 直接是 run_id 或在 r.data.run_id
    const runId = r?.run_id ?? r?.data?.run_id ?? r?.data?.id ?? r?.id
    if (!runId) {
      ElMessage.error('未获取到 run_id')
      return
    }

    currentRunId.value = String(runId)
    ElMessage.success('用例已提交运行')

    // 打开弹窗并连接 WebSocket
    dialogVisible.value = true
    // 等弹窗挂载后再连接，避免首帧无法渲染
    await nextTick()
    connect(currentRunId.value!)
  } catch (e: any) {
    ElMessage.error(e?.message || '提交运行失败')
  }
}

// 弹窗关闭时断开 WS
function onDialogClose() {
  disconnect()
  currentRunId.value = null
}










// 重置页面状态
function resetViewStateOnProjectChange() {
  openTabs.value = []
  activeTab.value = ''
  searchText.value = ''
  caseEditorRefs.value = {}
}

// 加载页面数据
async function loadPageData(projectId?: number | string) {
  const currentProjectId = projectId || projectStore.currentProjectId
  if (!currentProjectId) {
    return
  }
  await store.fetchModuleList()
}

// 整合初始化数据逻辑，包括重试机制
async function initDataWithRetry(projectId: number | string) {
  resetViewStateOnProjectChange()
  try {
    await loadPageData(projectId);
  } catch (error) {
    console.error('首次加载数据失败，将重试:', error);
    // 首次加载失败，尝试重试一次
    setTimeout(async () => {
      if (projectStore.currentProjectId) {
        try {
          await loadPageData(projectStore.currentProjectId);
        } catch (retryError) {
          console.error('重试加载数据也失败:', retryError);
        }
      }
    }, 1000);
  }
}

// 使用自定义的项目切换监听器组合式函数
useProjectChangeListener(async (newProjectId: number | string) => {
  await initDataWithRetry(newProjectId);
}, true, false)

// tree搜索功能
const searchText = ref('')
const treeRef = ref()
// 节点过滤方法
const filterNode = (value: string, data: any) => {
  return data.label.includes(value)
}

// 控制拖拽行为
const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  // 允许用例节点（case）被拖拽到模块节点（group）下
  // 允许模块节点（group）被拖拽到其他模块节点（group）下
  // 但不允许模块拖拽到其子模块下（防止循环引用）
  if (type !== 'inner') return false;
  
  if (draggingNode.data.type === 'case' && dropNode.data.type === 'group') {
    return true;
  }
  
  if (draggingNode.data.type === 'group' && dropNode.data.type === 'group') {
    // 检查是否有循环引用（不允许将父模块拖拽到子模块下）
    let parentNode = dropNode;
    while (parentNode) {
      if (parentNode.data.id === draggingNode.data.id) {
        return false;
      }
      parentNode = parentNode.parent;
    }
    return true;
  }
  
  return false;
}

// 处理拖拽完成事件
const handleNodeDrop = async (draggingNode: any, dropNode: any, dropType: string, ev: any) => {
  try {
    // 检查是否为有效拖拽
    if (dropType !== 'inner' || dropNode.data.type !== 'group') {
      return
    }

    // 处理用例拖拽
    if (draggingNode.data.type === 'case') {
      const caseId = draggingNode.data.id
      const targetModuleId = dropNode.data.id
      const caseName = draggingNode.data.label
      
      // 构造用例数据，只更新module字段
      const caseDataWithNewModule = {
        id: caseId,
        module: targetModuleId
      }

      // 调用API更新用例的模块信息
      await store.editUiTestCaseSimple(caseDataWithNewModule)
      
      // 显示成功消息
      ElMessage.success(`${caseName} 已成功移动到 ${dropNode.data.label}`)
      
      // 刷新模块列表，确保树结构正确显示
      await store.fetchModuleList()
      
      // 如果该用例在tab中打开，更新tab中的module信息
      const openTab = openTabs.value.find(tab => tab.id === caseId)
      if (openTab && openTab.caseData) {
        openTab.caseData.module = targetModuleId
      }
    }
    // 处理模块拖拽
    else if (draggingNode.data.type === 'group') {
      const moduleId = draggingNode.data.id
      const targetModuleId = dropNode.data.id
      const moduleName = draggingNode.data.label
      
      // 构造模块数据，更新parent字段
      const moduleDataWithNewParent = {
        parent: targetModuleId
      }

      // 调用API更新模块的上级信息
      await store.updateUiModule(moduleId, moduleDataWithNewParent)
      
      // 显示成功消息
      ElMessage.success(`${moduleName} 已成功移动到 ${dropNode.data.label}`)
      
      // 刷新模块列表，确保树结构正确显示
      await store.fetchModuleList()
    }
  } catch (error) {
    console.error('移动用例失败:', error)
    ElMessage.error('移动用例失败，请重试')
    // 失败时刷新列表恢复原状
    await store.fetchModuleList()
  }
}
watch(searchText, (val) => {
  treeRef.value!.filter(val)
})


function closeAllTabs() {
  // 移除所有未保存的用例
  openTabs.value.forEach(tab => {
    if (tab.name === '新建用例') {
      store.moduleList.forEach(group => {
        if (group.children) {
          group.children = group.children.filter(child => child.id !== tab.id);
        }
      });
    }
  });
  openTabs.value = []
  activeTab.value = ''
}

function addCase(group: CaseTreeNode) {
  const id = 0;
  const existingTab = openTabs.value.find(tab => tab.id === id);

  if (existingTab) {
    // 如果 tab 已存在，直接定位到该 tab
    activeTab.value = existingTab.id;
    return;
  }

  const node: CaseTreeNode = {
    id,
    label: '新建用例',
    type: 'case',
    caseData: {
      id: '0',
      name: '新建用例',
      description: '',
      steps: [],
      pre_apis: [],
      post_steps: [],
      enable: true,
      login_case: null
    }
  };

  group.children = group.children || [];
  group.children.push(node);

  const tab: Tab = {
    id: node.id,
    name: node.label,
    caseData: JSON.parse(JSON.stringify(node.caseData)),
    editable: true // 新建用例默认可编辑
  };

  openTabs.value.push(tab);
  activeTab.value = tab.id;
}

const deleteCase = async(node: CaseTreeNode) => {
  console.log(node)
  try {
    await ElMessageBox.confirm(`确认删除 ${node.label} 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await store.deleteUiTestCase(node.id)
    ElMessage.success('删除成功')

    // 检查是否有对应的 tab 打开，如果有则关闭
    const tabIndex = openTabs.value.findIndex((tab) => tab.id === node.id);
    if (tabIndex !== -1) {
      openTabs.value.splice(tabIndex, 1);

      // 更新 activeTab
      if (activeTab.value === node.id && openTabs.value.length > 0) {
        activeTab.value = openTabs.value[0].id;
      } else if (openTabs.value.length === 0) {
        activeTab.value = '';
      }
    }
  } catch (e) {
    console.error(e)
  }


}

// ======= 右侧Tab与多tab管理 =======
type Tab = {
  id: string | number,
  name: string,
  caseData: CaseData,
  editable?: boolean // 控制是否可编辑，默认为false
}
const openTabs = ref<Tab[]>([])
const activeTab = ref<string | number>('')

function onTreeNodeClick(node: CaseTreeNode) {
  if (node.type === 'case') openCase(node)
}

function openCase(node: CaseTreeNode) {
  let tab = openTabs.value.find(t => t.id === node.id)
  if (!tab) {
    // 打开新tab，从树结构打开的默认为不可编辑状态
    tab = {
      id: node.id,
      name: node.label,
      caseData: JSON.parse(JSON.stringify(node.caseData)),
      editable: false
    }
    openTabs.value.push(tab)
  }
  activeTab.value = node.id
}

function closeTab(id: string) {
  const idx = openTabs.value.findIndex(tab => tab.id === id);

  if (idx !== -1) {
    const tab = openTabs.value[idx];
    const isUnsaved = tab.name === '新建用例'; // 判断是否为未保存的用例
    if (isUnsaved) {
      // 从树中移除未保存的用例
      store.moduleList.forEach(group => {
        if (group.children) {
          group.children = group.children.filter(child => child.id !== id);
        }
      });
    }

    openTabs.value.splice(idx, 1);
    // 删除对应的引用
    delete caseEditorRefs.value[id];
  }

  // 更新 activeTab
  if (activeTab.value === id && openTabs.value.length > 0) {
    activeTab.value = openTabs.value[0].id;
  } else if (openTabs.value.length === 0) {
    activeTab.value = '';
  }
}

// 处理用例取消编辑
const handleCaseCancel = (tab: Tab) => {
  // 更新标签页的编辑状态
  const tabIndex = openTabs.value.findIndex(t => t.id === tab.id)
  if (tabIndex > -1) {
    openTabs.value[tabIndex].editable = false
    
    // 判断是否为未保存的新建用例
    const isUnsavedNewCase = tab.id === 0 || tab.name === '新建用例';
    
    if (isUnsavedNewCase) {
      // 对于未保存的新建用例，清空数据
      if (tab.caseData) {
        tab.caseData.steps = [];
        tab.caseData.pre_apis = [];
        tab.caseData.post_steps = [];
        // 深拷贝确保数据完全隔离
        openTabs.value[tabIndex].caseData = JSON.parse(JSON.stringify(tab.caseData));
      }
    } else {
      // 对于已保存的用例，从树结构中恢复原始数据
      let originalCaseData = null;
      // 使用递归查找确保能找到嵌套的用例数据
      const findOriginalCaseData = (modules: any[]): any => {
        for (const module of modules) {
          if (module.type === 'case' && module.id === tab.id) {
            return module.caseData;
          }
          if (module.children) {
            const found = findOriginalCaseData(module.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      originalCaseData = findOriginalCaseData(store.moduleList);
      
      // 如果找到原始数据，则恢复
      if (originalCaseData) {
        openTabs.value[tabIndex].caseData = JSON.parse(JSON.stringify(originalCaseData));
        openTabs.value[tabIndex].name = originalCaseData.name || tab.name;
      }
    }
    
    // 强制更新组件，确保UI显示最新数据
    nextTick(() => {
      // 如果有对应的编辑器引用，通知它更新
      if (caseEditorRefs.value[tab.id]) {
        caseEditorRefs.value[tab.id].setEditing(false);
      }
    });
  }
}

// ...existing code...
const saveCase = async (tab: Tab) => {
  console.log('保存用例:', tab);

  try {
    // 表单校验
    if (caseEditorRefs.value[tab.id] && caseEditorRefs.value[tab.id].validateForm) {
      const isValid = await caseEditorRefs.value[tab.id].validateForm();
      if (!isValid) {
        ElMessage.warning('用例数据校验失败，请检查输入');
        return;
      }
    }
    
    // 找到所属模块的 ID
    let moduleId = null;
    const findModuleId = (modules: any[]): any => {
      for (const module of modules) {
        if (module.children && module.children.some((child: any) => child.id === tab.id)) {
          return module.id;
        }
        if (module.children) {
          const found = findModuleId(module.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    moduleId = findModuleId(store.moduleList);

    if (!moduleId) {
      ElMessage.error('未找到所属模块，保存失败');
      return;
    }

    // 构造接口参数
    const caseDataWithModule = {
      ...tab.caseData,
      module: moduleId // 添加所属模块 ID
    };

    // 调用接口
    const action = tab.id && tab.id !== 0
      ? store.editUiTestCase(caseDataWithModule) // 编辑用例
      : store.createUiTestCase(caseDataWithModule); // 新建用例

    const res = await action;
    console.log('保存结果:', res);

    // 刷新模块列表，确保获取最新数据
    await store.fetchModuleList();

    // 解析接口返回 id/name（兼容 res.data、res.id 等多种格式）
    const returnedId = res?.data?.id ?? res?.id ?? res?.data?.pk ?? res?.pk ?? null;
    const returnedName = res?.data?.name ?? res?.name ?? tab.caseData?.name ?? '';

    // 在 moduleList 中按 id 查找最新用例，如果找不到再按 name 模糊匹配
    let updatedCaseData: any = null;
    const findCaseById = (modules: any[], id: any): any => {
      for (const m of modules) {
        if (m.children && Array.isArray(m.children)) {
          for (const c of m.children) {
            if (String(c.id) === String(id)) return c.caseData ?? c;
          }
        }
        if (m.children) {
          const found = findCaseById(m.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    if (returnedId) updatedCaseData = findCaseById(store.moduleList, returnedId);
    // fallback 按名称查找（可能有重复名，按第一个匹配）
    if (!updatedCaseData && returnedName) {
      const findCaseByName = (modules: any[], name: string): any => {
        for (const m of modules) {
          if (m.children && Array.isArray(m.children)) {
            for (const c of m.children) {
              const candidateName = (c.caseData?.name ?? c.label ?? '') + '';
              if (candidateName === name) return c.caseData ?? c;
            }
          }
          if (m.children) {
            const found = findCaseByName(m.children, name);
            if (found) return found;
          }
        }
        return null;
      };
      updatedCaseData = findCaseByName(store.moduleList, returnedName);
    }

    // 更新标签页数据
    const newId = returnedId ?? (tab.id && tab.id !== 0 ? tab.id : null);
    const index = openTabs.value.findIndex(t => String(t.id) === String(tab.id));
    if (index > -1) {
      // 优先使用树上找到的完整数据
      if (updatedCaseData) {
        openTabs.value[index].caseData = JSON.parse(JSON.stringify(updatedCaseData));
        openTabs.value[index].name = updatedCaseData.name ?? (returnedName || openTabs.value[index].name);
      } else {
        // 使用接口返回的数据或原有数据回填
        const fallbackData = res?.data ?? res ?? tab.caseData;
        openTabs.value[index].caseData = JSON.parse(JSON.stringify(fallbackData));
        openTabs.value[index].name = returnedName || (fallbackData.name ?? openTabs.value[index].name);
      }
      // 如果是新建（原 id 可能为 0），更新 id 并选中新 id
      if ((tab.id === 0 || String(tab.id) === '0') && newId) {
        openTabs.value[index].id = newId;
        openTabs.value[index].editable = false;
        // 等一轮 DOM 更新后切换 activeTab 到 newId，确保组件 key/name 更新
        await nextTick();
        activeTab.value = newId;
      } else {
        // 保持当前 activeTab（或更新名称）
        openTabs.value[index].editable = false;
        await nextTick();
      }
    }

    ElMessage.success('用例保存成功');
    
    // 选中新创建的用例节点：用 newId 优先
    const selectId = returnedId ?? (updatedCaseData?.id ?? null);
    if (treeRef.value && selectId) {
      // 等待DOM更新后再设置选中状态
      setTimeout(() => {
        treeRef.value.setCurrentKey(selectId);
      }, 100);
    }
  } catch (e) {
    console.error('保存失败:', e);
    ElMessage.error('保存失败，请稍后重试');
  }
};






// async function runCase(tab: Tab) {
//   // 可调后端接口
//   if (!tab.id) {
//     ElMessage.error('用例未保存')
//     return  
//   }
  
//   const r = await store.runUiTestCase(Number(tab.id))
//   console.log('r', r)
//   if (r) {
//     ElMessage.success('用例已提交运行')
//   }
// }

// 添加模块相关 ================================================================
const dialogRef = ref()
const moduleDialogFormFields = ref(
  [
    { 
      prop: 'name', 
      label: '分组名称',
      component: 'el-input',
      attrs: { placeholder: '请输入分组名称' } 
    }
  ]
)

const formRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在2-30个字符', trigger: ['blur', 'change'] }
  ]
}
// 表单提交
const handleSubmit = async (data: any, mode: 'add', done: (success?: boolean) => void) => {
  try {
    console.log('parent == ', data.parent)
    // 如果有parent参数，添加到data中
    if (data.parent !== undefined && data.parent !== null) {
      const parentId = data.parent;
      // 移除parent参数，因为BaseDialog会把所有参数都包含在data中
      delete data.parent;
      // 调用接口创建子模块
      await store.createUiModule({
        ...data,
        parent: parentId
      })
    } else {
      // 创建顶级模块
      await store.createUiModule(data)
    }
    store.fetchModuleList()
    ElMessage.success('分组添加成功')
    done(true)
  } catch (error) {
    done(false)
  }
}
// 添加dialog open
// const openAddDialog = (parentId: number | null = null) => dialogRef.value?.open('add', { parent: parentId })

const openAddDialog = (parentId?: any) => {
  // 当作为 @click 直接绑定时，浏览器会把 MouseEvent 作为第一个参数传入，
  // 导致 parentId 不是我们期望的数值。这里做防护处理：
  // - 如果传入的是事件对象（含 target），则视为无 parent，传 null。
  // - 否则按传入值（数字或 null）使用。
  if (parentId && typeof parentId === 'object' && ('target' in parentId || parentId instanceof Event)) {
    parentId = null;
  }
  dialogRef.value?.open('add', { parent: parentId ?? null })
}

// 新建子模块
const addSubModule = (parentModule: any) => {
  openAddDialog(parentModule.id)
}

// 开始重命名
const renameModule = (module: any) => {
  if (module.type !== 'group') return
  
  // 退出其他节点的编辑状态
  if (isEditing.value) {
    cancelEdit()
  }
  
  // 开始当前节点的编辑
  newLabel.value = module.label
  editingNodeId.value = module.id
  isEditing.value = true
  
  nextTick(() => {
    if (nameInput.value) {
      nameInput.value.focus()
      nameInput.value.select()
    }
  })
}

// 保存重命名
// 递归查找并更新树节点名称
const updateTreeNodeName = (nodes: any[], nodeId: string | number, newName: string): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    if (String(nodes[i].id) === String(nodeId)) {
      nodes[i].label = newName
      return true
    }
    if (nodes[i].children && nodes[i].children.length > 0) {
      const found = updateTreeNodeName(nodes[i].children, nodeId, newName)
      if (found) return true
    }
  }
  return false
}

// 防抖标记，防止短时间内重复调用handleSave
let isSaving = false

const handleSave = async () => {
  // 如果正在保存中，直接返回
  if (isSaving) {
    return
  }
  
  if (!newLabel.value.trim()) {
    ElMessage.warning('名称不能为空')
    return
  }
  
  try {
    // 设置保存中标记
    isSaving = true
    
    // 调用store的方法重命名模块
    await store.renameModule(editingNodeId.value, newLabel.value)
    
    // 手动更新本地树节点名称，保持展开状态
    updateTreeNodeName(store.moduleList, editingNodeId.value, newLabel.value)
    
    // 不需要重新加载整个树结构
    // await store.fetchModuleList()
    
    isEditing.value = false
    editingNodeId.value = ''
    newLabel.value = ''
    
    ElMessage.success('重命名成功')
  } catch (error) {
    ElMessage.error('重命名失败')
    cancelEdit()
    console.error('重命名失败:', error)
  } finally {
    // 无论成功失败，都要清除保存中标记
    // 使用setTimeout确保在事件循环的下一个tick执行，避免快速连续的保存操作
    setTimeout(() => {
      isSaving = false
    }, 300)
  }
}

// 取消重命名
const cancelEdit = () => {
  isEditing.value = false
  editingNodeId.value = ''
  newLabel.value = ''
}

// 删除模块相关 ================================================================
const deleteModule = async (row: any) => {
  try {
    console.log(row)
    await ElMessageBox.confirm(`确认删除 ${row.label} 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await store.deleteUiModule(row.id)
  } catch (e) {
    console.error('删除分组失败：', e)
  }
}

// 批量执行用例相关
const checkedNodeIds = ref<number[]>([]); // 存储选中的节点 ID

// 复制用例功能
const copyCase = async (node: CaseTreeNode) => {
  try {
    // 检查node和node.label是否存在
    if (!node || !node.label) {
      ElMessage.error('用例信息不完整');
      return;
    }
    
    await ElMessageBox.confirm(`确认复制 ${node.label} 吗？`, '提示', {
      type: 'info',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    // 递归查找所属模块
    let parentModuleId = null;
    const findParentModuleId = (modules: any[], targetId: any): number | null => {
      for (const module of modules) {
        if (module.children && Array.isArray(module.children)) {
          // 检查当前模块的直接子节点
          if (module.children.some((child: any) => child.id === targetId)) {
            return module.id;
          }
          // 递归检查子模块
          const found = findParentModuleId(module.children.filter((c: any) => c.type === 'group'), targetId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    parentModuleId = findParentModuleId(store.moduleList, node.id);
    
    if (!parentModuleId) {
      ElMessage.error('未找到所属模块');
      return;
    }
    
    // 检查caseData是否存在
    if (!node.caseData) {
      ElMessage.error('用例数据不完整');
      return;
    }
    
    // 创建复制的用例数据
    const copiedCaseData = {
      ...JSON.parse(JSON.stringify(node.caseData)),
      id: '0', // 新用例ID为0表示新建
      name: `${node.caseData.name}-copy`, // 名称后增加-copy后缀
      module: parentModuleId // 添加所属模块ID
    };
    
    // 调用创建接口直接创建新用例
    const res = await store.createUiTestCase(copiedCaseData);
    
    // 刷新模块列表以显示新创建的用例
    await store.fetchModuleList();
    
    ElMessage.success('用例复制成功！');
    
    // 查找新创建的用例并打开编辑页面
    for (const module of store.moduleList) {
      if (module.id === parentModuleId && module.children) {
        const newCaseNode = module.children.find(child => 
          child.type === 'case' && child.label === copiedCaseData.name
        );
        if (newCaseNode) {
          openCase(newCaseNode);
          break;
        }
      }
    }
  } catch (e) {
    // 用户取消确认也会走到这里，不做处理
    console.error(e);
  }
}
  const browserDialog = reactive({
  visible: false,
  form: {
    browser_type: '', // 浏览器类型
    headless: false, // 是否无头模式
  },
});

// 打开弹窗
function openBatchRunDialog() {
  if (checkedNodeIds.value.length === 0) {
    ElMessage.warning('选择的用例为空');
    return;
  }
  browserDialog.visible = true;
}


function onCheckChange(data: any, checked: boolean, indeterminate: boolean) {
  // 获取所有选中的节点
  const checkedNodes = treeRef.value?.getCheckedNodes();
  checkedNodeIds.value = checkedNodes
    .filter((node: any) => node.type === 'case') // 仅保留有父节点的节点（即二级节点）
    .map((node: any) => node.id);
  // console.log('选中的节点 ID:', checkedNodeIds.value);
}

const handleBatchRunTestCases = async () => {
  console.log('in run by module')
  // if (checkedNodeIds.value.length === 0) {
  //   ElMessage.warning('选择的用例为空');
  //   return;
  // }

  try {
    const payload = {
      browser_type: browserDialog.form.browser_type || null, // 如果为空，传递 null
      headless: browserDialog.form.headless,
      case_ids: checkedNodeIds.value
    };
    console.log('提交的参数:', payload);
    const response = await uiTestApi.runSelectedUiTestCase(payload)
    if (response) {
      ElMessage.success('批量执行已提交');
      browserDialog.visible = false; // 关闭弹窗  
    }
    // console.log('批量执行结果:', response);
  } catch (error) {
    console.error('批量执行失败:', error);
    ElMessage.error('批量执行失败，请稍后重试');
  }
}




// 初始化钩子 - 仅保留日志输出，所有初始化逻辑已整合到useProjectChangeListener中
onMounted(() => {
  // console.log('UiTestCasePage: 页面初始化完成，数据加载由useProjectChangeListener统一处理');
})


</script>

<style scoped>
/* 主容器样式 */
.ui-test-case-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 900px; /* 确保整体页面有最小宽度，防止布局错乱 */
}

.main-content-row {
  height: 100%;
  display: flex;
  flex-wrap: nowrap; /* 禁止换行，确保左右两列始终在同一行 */
  min-height: 0;
}

/* 左侧树容器样式 */
.tree-container {
  height: 100%;
  border-right: 1px solid #eee;
  overflow-y: auto;
  overflow-x: hidden; /* 隐藏横向滚动条 */
  text-align: left;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-width: 280px; /* 设置最小宽度，防止随页面变小而一直变窄 */
}

.tree-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  flex-shrink: 0;
}

.add-group-btn {
  margin: 0 !important;
  flex-shrink: 0;
}

.batch-run-btn {
  margin: 0 !important;
  flex-shrink: 0;
  
}

.search-input {
  margin: 8px 12px !important;
  width: calc(100% - 24px);
  flex-shrink: 0;
}

.case-tree {
  flex: 1;
  padding: 0 8px;
  margin-top: 0;
  width: 100%;
  min-width: 0; /* 确保内容不会强制容器变宽 */
}

/* 右侧编辑容器样式 */
.editor-container {
  height: 100%;
  overflow: auto;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  flex: 1; /* 占据剩余空间 */
  min-width: 500px; /* 为右侧编辑区设置最小宽度 */
  min-height: 0;
}

.editor-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.close-all-btn {
  margin: 0 !important;
}

.case-tabs {
  flex: 1;
  margin-top: 0;
  padding: 0 16px;
}

.empty-state {
  color: #aaa;
  text-align: center;
  padding: 90px 0;
  font-size: 14px;
}

/* 树节点样式 */
.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 36px;
  line-height: 36px;
  padding: 0 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.tree-node:hover {
  background-color: #f0f0f0;
}

.tree-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0; /* 防止flex子元素溢出容器 */
}

.tree-node-label {
  display: inline-block;
  flex: 1;
  max-width: calc(100% - 60px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  font-size: 14px;
  min-width: 0;
}

/* 图标样式 */
.el-icon {
  font-size: 16px;
  margin-right: 6px;
  color: #e6a23c;
  
  &[data-type="case"] {
    color: #67c23a;
  }
}

/* 树头部样式 */
.tree-header {
  padding-right: 10px; /* 防止右侧边缘内容被遮挡 */
}

/* 批量执行按钮样式 */
.batch-run-btn {
  margin-right: 15px; /* 为按钮添加明确的右侧边距 */
}

/* 三点按钮样式 */
.more-btn {
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  margin-right: 10px;
  flex-shrink: 0;
}

.tree-node:hover .more-btn {
  opacity: 1;
}

.icon-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 选中节点的样式增强 */
.el-tree-node.is-current > .el-tree-node__content {
  background-color: #e6f7ff !important;
  color: #1890ff;
  font-weight: 500;
}

/* 滚动条样式优化 */
.tree-container::-webkit-scrollbar,
.editor-container::-webkit-scrollbar {
  width: 6px;
  height: 0; /* 隐藏横向滚动条 */
}

.tree-container::-webkit-scrollbar-track,
.editor-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb,
.editor-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb:hover,
.editor-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 针对Edge浏览器的滚动条隐藏 */
.tree-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 确保el-tree组件不会产生横向滚动条 */
.el-tree {
  overflow-x: hidden !important;
}

/* 确保树节点内容不会溢出 */
.el-tree-node__content {
  min-width: 0 !important;
  box-sizing: border-box !important;
}

</style>
