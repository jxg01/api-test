<template>
  <div class="tree-node">
    <div class="node-content">
      <el-icon :class="data.type">
        <component :is="data.type === 'case' ? 'Document' : 'Folder'" />
      </el-icon>
      <span>{{ node.label }}</span>
    </div>

    <div class="node-actions">
      <el-dropdown 
        ref="dropdownRef"
        trigger="click" 
        placement="bottom-end"
        @command="handleCommand"
        :hide-on-click="false"
      >
        <el-button type="info" size="small" circle @click.stop>
          <el-icon><MoreFilled /></el-icon>
        </el-button>

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

    <!-- 重命名弹窗 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="重命名"
      width="30%"
      @closed="handleDialogClose"
      append-to-body
    >
      <el-form @click.stop>
        <el-form-item label="新名称">
          <el-input 
            v-model="newLabel" 
            ref="renameInput"
            placeholder="请输入新名称"
            clearable
            @click.stop
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRenameSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
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

const emit = defineEmits(['delete', 'add-module', 'add-interface'])

// 弹窗控制
const renameDialogVisible = ref(false)
const newLabel = ref('')
const renameInput = ref()
const dropdownRef = ref<InstanceType<typeof ElDropdown>>()
const store = useInterfaceStore()

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  dropdownRef.value?.handleClose()
  switch (command) {
    case 'rename':
      newLabel.value = props.data.label
      renameDialogVisible.value = true
      nextTick(() => {
        renameInput.value?.focus()
        renameInput.value?.select()
      })
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

// 提交重命名
const handleRenameSubmit = async () => {
  if (!newLabel.value.trim()) {
    ElMessage.warning('名称不能为空')
    return
  }

  try {
    await store.editNode(props.data.id, newLabel.value, props.data.type)
    ElMessage.success('重命名成功')
    renameDialogVisible.value = false
  } catch (error) {
    ElMessage.error('重命名失败')
    console.error('重命名失败:', error)
  }
}

// 关闭弹窗时重置
const handleDialogClose = () => {
  newLabel.value = props.data.label
}

// 删除处理（保持不变）
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
/* 保持原有样式不变 */
.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0;
  
  &:hover .node-actions {
    opacity: 1;
  }
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

/* 弹窗样式优化 */
:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>