<template>
    <div class="tree-node">
      <div class="node-content">
        <el-icon :class="data.type">
          <component :is="data.type === 'case' ? 'Document' : 'Folder'" />
        </el-icon>
        
        <!-- 可编辑的节点名称 -->
        <div class="node-label">
          <el-input
            v-if="isEditing"
            ref="nameInput"
            v-model="newLabel"
            size="small"

            @keyup.enter="handleSave"
            @keyup.esc="cancelEdit"
          />
          <span v-else>{{ node.label }}</span>
        </div>
      </div>
  
      <div class="node-actions">
        <el-dropdown 
          trigger="click" 
          placement="bottom-end"
          @command="handleCommand"
        >
          <!-- 更多按钮 -->
          <el-button 
            type="info" 
            size="small" 
            circle 
            @click.stop
          >
            <el-icon><MoreFilled /></el-icon>
          </el-button>
  
          <!-- 下拉菜单 -->
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="rename" @click.stop="() => {}">重命名</el-dropdown-item>
              <template v-if="data.type === 'node'">
                <el-dropdown-item command="addModule">添加模块</el-dropdown-item>
                <el-dropdown-item command="addInterface">添加接口</el-dropdown-item>
              </template>
              <el-dropdown-item 
                command="delete" 
                divided
                style="color: #F56C6C;"
              >
                <span style="color: #F56C6C;">删除</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, nextTick, watch } from 'vue'
  import { MoreFilled } from '@element-plus/icons-vue'
  import { useInterfaceStore } from '@/stores/interface'
  import { ElMessage, ElDropdown } from 'element-plus'
  
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

  const dropdownRef = ref<InstanceType<typeof ElDropdown>>()
  
  const emit = defineEmits(['delete', 'add-module', 'add-interface'])
  
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
        console.log('nameInput', nameInput.value)
      nameInput.value?.focus()
      nameInput.value?.select() // 自动全选文本
    })
  }
  
  // 保存修改
  const handleSave = async () => {
    if (!newLabel.value.trim()) {
      ElMessage.warning('名称不能为空')
      return
    }
    
    try {
      await store.editNode(props.data.id, newLabel.value, props.data.type)
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
  
  // 处理下拉菜单命令
  const handleCommand = (command: string) => {
    dropdownRef.value?.handleClose()
    switch (command) {
      case 'rename':
        startEditing()
        break
      case 'addModule':
        emit('add-module', props.data.id)
        break
      case 'addInterface':
        emit('add-interface', props.data.id)
        break
      case 'delete':
        handleDelete()
        break
    }
  }
  
  // 删除处理
  const handleDelete = async () => {
    try {
      await store.deleteNode(props.data.id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }
  </script>

  <style scoped>
  .tree-node {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 4px 0;
    
    &:hover .node-actions {
      opacity: 1;
    }
  }

  :deep(.el-dropdown-menu__item) {
    font-size: 13px;
    padding: 8px 16px;
  }

  :deep(.el-dropdown-menu__item.divided) {
    border-top: 1px solid #eee;
    margin-top: 4px;
    padding-top: 8px;
  }

  .node-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    
    .el-icon {
      color: #e6a23c;
      
      &[data-type="case"] {
        color: #67c23a;
      }
    }
  }
  
  .node-actions {
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    gap: 4px;
    margin-left: auto;
    padding-right: 8px;
  }

  .node-label {
  /* margin-left: 8px; */
  /* flex: 1; */
  
  :deep(.el-input) {
    width: 80%;
    .el-input__wrapper {
      padding: 0 8px;
      height: 24px;
    }
  }
}
  </style>
