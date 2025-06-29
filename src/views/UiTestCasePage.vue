<template>
  <div style="width: calc(100vh-180px);">
    <el-row>
      <!-- 左侧树结构 -->
      <el-col :span="6" style="height: 100%; border-right: 1px solid #eee; overflow-y: auto; text-align: left;">
        <el-button type="primary" :icon="Plus" @click="openAddDialog" style="margin: 12px 0 12px 0;">新建分组</el-button>
        <el-input
          v-model="searchText"
          placeholder="输入分组名称或接口名称搜索"
          clearable
          size="large"
          style="margin-bottom: 8px;"
        />
        <el-tree
          ref="treeRef"
          :data="store.moduleList"
          node-key="id"
          :props="{ label: 'label', children: 'children' }"
          @node-click="onTreeNodeClick"
          highlight-current
          style="padding: 0 8px"
          default-expand-all
          :filter-node-method="filterNode"
          @tab-remove="closeTab"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon :class="data.type" :data-type="data.type">
                <component :is="data.type === 'case' ? 'Document' : 'Folder'" />
              </el-icon>
              <div class="tree-node-content">
                <!-- 名称区加 ellipsis 和 Tooltip -->
                <!-- <el-tooltip :content="data.label" placement="top"> -->
                  <span
                    style="
                      display: inline-block;
                      max-width: 600px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      vertical-align: middle;
                    "
                  >{{ data.label }}</span>
                <!-- </el-tooltip> -->
                <!-- <span
                  v-else
                  style="
                    display: inline-block;
                    max-width: 600px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 100%;
                  "
                >{{ data.label }}</span> -->
                <!-- 操作按钮区始终右对齐 -->
                <!-- <span style="margin-left:10px; flex-shrink: 0;"> -->
                <span class="action-buttons">
                  <template v-if="data.type === 'case'">
                    <el-button link type="primary" size="small" @click.stop="openCase(data)">编辑</el-button>
                    <el-button link type="primary" size="small" @click.stop="deleteCase(data)">删除</el-button>
                  </template>
                  <template v-else>
                    <el-button link type="warning" size="small" @click.stop="addCase(data)">新建用例</el-button>
                    <el-button link type="warning" size="small" @click.stop="deleteModule(data)">删除</el-button>
                  </template>
                </span>
              </div>
            </div>
          </template>
        </el-tree>
      </el-col>

      <!-- 右侧Tab页和编辑区 -->
      <el-col :span="18" style="height: 100%; overflow: auto; padding: 0 16px;">
        <el-button type="danger" size="small" @click="closeAllTabs" style="margin-right: 4px; float: right;">关闭全部Tab</el-button>
        <el-tabs
          v-model="activeTab"
          type="card"
          closable
          @tab-remove="closeTab"
          style="flex: 1"
        >
          <el-tab-pane
            v-for="tab in openTabs"
            :key="tab.id"
            :label="tab.name"
            :name="tab.id"
          >
            <CaseEditor
              v-model:caseData="tab.caseData"
              @save="saveCase(tab)"
              @run="runCase(tab)"
            />
          </el-tab-pane>
        </el-tabs>
        <div v-if="openTabs.length === 0" style="color:#aaa;text-align:center;padding:90px 0 0 0;">← 点击左侧用例树节点编辑</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CaseEditor from '@/components/UiTest/CaseEditor.vue'
import { Plus } from '@element-plus/icons-vue'
import { useUiTestStore, CaseTreeNode, CaseData } from '@/stores/uiTestStore'
import BaseDialog from '@/components/BaseDialog.vue'
import { number } from 'echarts'

const store = useUiTestStore()

// tree搜索功能
const searchText = ref('')
const treeRef = ref()
// 节点过滤方法
const filterNode = (value: string, data: any) => {
  return data.label.includes(value)
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
    }
  };

  group.children = group.children || [];
  group.children.push(node);

  const tab: Tab = {
    id: node.id,
    name: node.label,
    caseData: JSON.parse(JSON.stringify(node.caseData))
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
  caseData: CaseData
}
const openTabs = ref<Tab[]>([])
const activeTab = ref<string | number>('')

function onTreeNodeClick(node: CaseTreeNode) {
  if (node.type === 'case') openCase(node)
}

function openCase(node: CaseTreeNode) {
  let tab = openTabs.value.find(t => t.id === node.id)
  if (!tab) {
    // 打开新tab
    tab = {
      id: node.id,
      name: node.label,
      caseData: JSON.parse(JSON.stringify(node.caseData))
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
  }

  // 更新 activeTab
  if (activeTab.value === id && openTabs.value.length > 0) {
    activeTab.value = openTabs.value[0].id;
  } else if (openTabs.value.length === 0) {
    activeTab.value = '';
  }
}

const saveCase = async (tab: Tab) => {
  console.log('保存用例:', tab);

  try {
    // 找到所属模块的 ID
    let moduleId = null;
    store.moduleList.forEach(group => {
      if (group.children) {
        const caseNode = group.children.find(child => child.id === tab.id);
        if (caseNode) {
          moduleId = group.id; // 提取模块 ID
        }
      }
    });

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
    const action = tab.id
      ? store.editUiTestCase(caseDataWithModule) // 编辑用例
      : store.createUiTestCase(caseDataWithModule); // 新建用例

    const res = await action;
    console.log('保存结果:', res);

    // 更新树结构中的用例数据
    store.moduleList.forEach(group => {
      group.children?.forEach(c => {
        if (c.id === tab.id) {
          c.caseData = JSON.parse(JSON.stringify(tab.caseData));
          c.label = tab.caseData.name;
        }
      });
    });

    tab.name = tab.caseData.name;
    ElMessage.success('用例保存成功');
  } catch (e) {
    console.error('保存失败:', e);
  }
};








async function runCase(tab: Tab) {
  // 可调后端接口
  if (!tab.id) {
    ElMessage.error('用例未保存')
    return  
  }
  
  const r = await store.runUiTestCase(Number(tab.id))
  if (r) {
    ElMessage.success('用例已提交运行')
  }
}

// 添加模块相关 ================================================================
const dialogRef = ref()
const moduleDialogFormFields = ref(
  [
    { 
      prop: 'name', 
      label: '分组名称',
      component: markRaw(ElInput),
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
    console.log(data)
    await store.createUiModule(data)
    store.fetchModuleList()
    ElMessage.success('分组添加成功')
    done(true)
  } catch (error) {
    done(false)
  }
}
// 添加dialog open
const openAddDialog = () => dialogRef.value?.open('add', {})

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






onMounted(async () => {
  await store.fetchModuleList()
})


</script>

<style scoped>
.el-icon {
  font-size: 20px;
  margin-right: 5px;
  color: #e6a23c;
  
  &[data-type="case"] {
    color: #67c23a;
  }
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.tree-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.action-buttons {
  display: none; /* 默认隐藏按钮 */
}

.tree-node:hover .action-buttons {
  display: inline-flex; /* 鼠标悬浮时显示按钮 */
  gap: 2px; /* 按钮之间的间距 */
}

</style>
