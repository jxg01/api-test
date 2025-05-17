<template>
  <div class="tree-node">
    <div class="node-content">
      <el-icon :class="data.type" :data-type="data.type">
        <component :is="data.type === 'case' ? 'Document' : 'Folder'" />
      </el-icon>
      
      <!-- 可编辑的节点名称 -->
      <div class="node-label">
        <template v-if="isEditing">
          <el-input 
            ref="nameInput"
            v-model="newLabel"
            size="small"
            @blur="handleSave"
            @keyup.enter="handleSave"
            @keydown.esc="cancelEdit"
            :maxlength="50"
            @click.stop
          />
        </template>
        <template v-else>
          <el-tooltip 
            effect="dark" 
            :content="node.label" 
            placement="top"
            :disabled="!isLabelOverflow"
          >
            <span class="label-text">{{ node.label }}</span>
          </el-tooltip>
          <el-dropdown trigger="click">
            <!-- 使用 click.stop 来阻止事件冒泡，不会触发上级元素的点击事件 -->
            <el-icon class="more-btn" @click.stop><more-filled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-if="data.type === 'node'">
                  <el-dropdown-item @click="openAddDialog">添加模块</el-dropdown-item>
                  <el-dropdown-item @click="addInterface">添加接口</el-dropdown-item>
                </template>
                <el-dropdown-item @click="startEditing">重命名</el-dropdown-item>
                <el-dropdown-item divided @click="handleDelete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>

    <BaseDialog 
      ref="dialogRef"
      :fields="formFields"
      :rules="formRules"
      title="模块"
      @submit="handleSubmit"
      @click.stop />

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import { useInterfaceStore } from '@/stores/interface'
import { ElMessage, ElDropdown, ElMessageBox } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'

  // 表单配置 =================================================================
  const dialogRef = ref()
  const formFields = [
    { 
      prop: 'name', 
      label: '模块名称',
      component: ElInput,
      attrs: { placeholder: '请输入模块名称' } 
    },
  ]
  const formRules = {
    name: [
      { required: true, message: '请输入模块名称', trigger: 'blur' },
      { min: 2, max: 30, message: '长度在2-30个字符', trigger: ['blur', 'change'] }
    ]
  }
  // 表单提交
  const handleSubmit = async (data: any, mode: 'add', done: (success?: boolean) => void) => {
    try {
      console.log('提交数据', props.data)
      await store.addModule({
        name: data.name,
        project: store.selectedProjectId,
        parent_module: props.data.id
      })
      ElMessage.success('模块添加成功')
      done(true)
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
      done(false)
    }
  }
  const openAddDialog = () => dialogRef.value?.open('add', {})

// 添加文本溢出检测
const labelRef = ref<HTMLElement>()
const isLabelOverflow = ref(false)

onMounted(() => {
  if (labelRef.value) {
    isLabelOverflow.value = 
      labelRef.value.scrollWidth > labelRef.value.clientWidth
  }
})

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  data: {
    type: Object,
    required: true,
    validator: (value) => ['node', 'case'].includes(value.type)
  }
})

// 编辑状态控制
const isEditing = ref(false)
const newLabel = ref('')
const nameInput = ref<HTMLInputElement>()
const store = useInterfaceStore()

// 进入编辑模式
const startEditing = () => {
  newLabel.value = props.data.label
  isEditing.value = true
  nextTick(() => {
    if (nameInput.value) {
      nameInput.value.focus()
      nameInput.value.select()
    }
  })
}

// 保存修改
const handleSave = async () => {
  if (!newLabel.value.trim()) {
    ElMessage.warning('名称不能为空')
    return
  }
  try {
    await store.renameNode(props.data.id, newLabel.value, props.data.type)
    isEditing.value = false
  } catch (error) {
    ElMessage.error('重命名失败')
    // 恢复原始值
    newLabel.value = props.data.label
    isEditing.value = false
    console.log('重命名失败', error)
  }
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  newLabel.value = props.data.label
}

// 更新树形数据
const addCaseToTree = (nodes: TreeNode[], newTabData: any): TreeNode[] => {
  return nodes.map(node => {
    if (node.id === props.data.id) {
      node.children = node.children || []
      node.children.push({
        id: newTabData.id,
        label: newTabData.label,
        type: 'case',
        originData: newTabData
      })
    } else if (node.children) {
      node.children = addCaseToTree(node.children, newTabData)
    }
    return node
  })
}

// 添加接口 区域展示
const addInterface = () => {
  try {
    const tem_id = -1
    const newTab = {
      'id': tem_id,
      'label': '新建接口',
      'detail': {
        'method': 'GET',
        'path': '',
        'module': props.data.id,
        'name': '新建接口',
        'id': tem_id
      }
    }
    store.addTab(newTab)
    // 更新树形数据
    store.treeData = addCaseToTree(store.treeData, newTab)
  } catch (error) {
    console.log('打开添加接口页面失败 => ', error)
  }
}

// 删除处理
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除 ${props.data.label} 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await store.deleteModule(props.data.id, props.data.type)
    ElMessage.success('删除成功')
  } catch (error) {
    // ElMessage.error('删除失败')
    console.log('删除失败', error)
  }
}
</script>

<style scoped lang="scss">
.tree-node {
  display: flex;
  align-items: center;
  width: 90%;
  padding: 4px 0;
  
  &:hover .more-btn {
    opacity: 1;
  }
}

.node-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  
  .el-icon {
    color: #e6a23c;
    
    &[data-type="case"] {
      color: #67c23a;
    }
  }
}

.node-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;

  .label-text {
    min-width: 0; /* 关键属性2：允许文本容器收缩 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .more-btn {
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    margin-right: 10px;
    flex-shrink: 0;
  }
}

</style>
