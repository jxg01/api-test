<template>
  <el-row style="height: 100vh;">
    <!-- 左侧树结构 -->
    <el-col :span="6" style="height: 100%; border-right: 1px solid #eee; overflow-y: auto; text-align: left;">
      <el-button type="primary" :icon="Plus" @click="addCaseGroup" style="margin: 12px 0 12px 0;">新建分组</el-button>
      <el-input
        v-model="searchText"
        placeholder="输入模块名称或接口名称搜索"
        clearable
        size="large"
        style="margin-bottom: 8px;"
      />
      <el-tree
        ref="treeRef"
        :data="caseTree"
        node-key="id"
        :props="{ label: 'label', children: 'children' }"
        @node-click="onTreeNodeClick"
        highlight-current
        style="padding: 0 8px"
        draggable
        default-expand-all
        :filter-node-method="filterNode"
      >
        <template #default="{ node, data }">
          <el-icon :class="data.type" :data-type="data.type">
            <component :is="data.type === 'case' ? 'Document' : 'Folder'" />
          </el-icon>
          <div
            style="display:flex;align-items:center;justify-content:space-between;width:100%;"
          >
            <!-- 名称区加 ellipsis 和 Tooltip -->
            <el-tooltip :content="data.label" placement="top" v-if="data.label.length > 12">
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
            </el-tooltip>
            <span
              v-else
              style="
                display: inline-block;
                max-width: 600px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 100%;
              "
            >{{ data.label }}</span>
            <!-- 操作按钮区始终右对齐 -->

            <span style="margin-left:10px; flex-shrink: 0;">
              <template v-if="data.type === 'case'">
                <el-button link type="primary" size="small" @click.stop="openCase(data)">编辑</el-button>
                <el-button link type="primary" size="small" @click.stop="deleteCase(data)">删除</el-button>
              </template>
              <template v-else>
                <el-button link type="primary" size="small" @click.stop="addCase(data)">新建用例</el-button>
              </template>
            </span>
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
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import CaseEditor from '@/components/UiTest/CaseEditor.vue'
import { Plus } from '@element-plus/icons-vue'
import { useUiTestStore } from '@/stores/uiTestStore'

const store = useUiTestStore()
// ======= 用例树数据与操作 =======

// 树节点类型
type CaseTreeNode = {
  id: string
  label: string
  type: 'group' | 'case'
  children?: CaseTreeNode[]
  caseData?: CaseData  // 仅type=case时有
}
type CaseData = {
  id: string
  name: string
  description: string
  pre_apis: []
  steps: Step[]
  post_steps: []
  enable: boolean
}

type Step = {
  action: string,
  url?: string,
  selector?: string,
  header?: string,
  expect?: string
}

// 示例数据
const caseTree = ref<CaseTreeNode[]>([
  {
    id: 'group-1',
    label: '用户模块',
    type: 'group',
    children: [
      {
        id: 'case-1',
        label: '用户中心-用户名检查',
        type: 'case',
        caseData: {
          id: 'case-1',
          name: '用户中心-用户名检查',
          description: '校验用户名是否正确',
          steps: [
            { action: 'set_header', header: '{"Authorization":"Bearer ${token}"}' },
            { action: 'goto', url: 'http://yourdomain.com/protected/page' },
            { action: 'assert_text', selector: '.user', expect: 'testuser' }
          ],
          pre_apis: [],
          post_steps: [],
          enable: false
        }
      }
    ]
  },
  {
    id: 'group-2',
    label: '订单模块',
    type: 'group',
    children: []
  }
])



// tree搜索功能
const searchText = ref('')
const treeRef = ref()
  // 节点过滤方法
// 节点过滤方法
const filterNode = (value: string, data: any) => {
  return data.label.includes(value)
}
watch(searchText, (val) => {
  treeRef.value!.filter(val)
})



function closeAllTabs() {
  openTabs.value = []
  activeTab.value = ''
}

function addCaseGroup() {
  const name = prompt('分组名称')?.trim()
  if (name) {
    caseTree.value.push({
      id: `group-${Date.now()}`,
      label: name,
      type: 'group',
      children: []
    })
  }
}
function addCase(group: CaseTreeNode) {
  const name = prompt('用例名称')?.trim()
  if (name) {
    const id = `case-${Date.now()}`
    const node: CaseTreeNode = {
      id,
      label: name,
      type: 'case',
      caseData: {
        id,
        name,
        description: '',
        steps: [],
        pre_apis: [],
        post_steps: [],
        enable: true
      }
    }
    group.children = group.children || []
    group.children.push(node)
    openCase(node)
  }
}
function deleteCase(node: CaseTreeNode) {
  caseTree.value.forEach(group => {
    if (group.children) {
      group.children = group.children.filter(c => c.id !== node.id)
    }
  })
  closeTab(node.id)
}

// ======= 右侧Tab与多tab管理 =======
type Tab = {
  id: string,
  name: string,
  caseData: CaseData
}
const openTabs = ref<Tab[]>([])
const activeTab = ref<string>('')

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
  const idx = openTabs.value.findIndex(t => t.id === id)
  if (idx !== -1) openTabs.value.splice(idx, 1)
  if (activeTab.value === id && openTabs.value.length > 0) activeTab.value = openTabs.value[0].id
}

function saveCase(tab: Tab) {
  // 保存到树
  console.log('保存用例:', tab)
  caseTree.value.forEach(group => {
    group.children?.forEach(c => {
      if (c.id === tab.id) c.caseData = JSON.parse(JSON.stringify(tab.caseData))
      if (c.id === tab.id) c.label = tab.caseData.name
    })
  })
  tab.name = tab.caseData.name
  ElMessage.success('已保存')
}

function runCase(tab: Tab) {
  // 可调后端接口
  ElMessage.info(`调试运行: ${tab.name}`)
}




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



</style>
