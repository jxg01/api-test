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
                  <el-dropdown-item @click="store.addModule">添加模块</el-dropdown-item>
                  <el-dropdown-item @click="store.addInterface">添加接口</el-dropdown-item>
                </template>
                <el-dropdown-item @click="startEditing">重命名</el-dropdown-item>
                <el-dropdown-item divided @click="handleDelete">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import { useInterfaceStore } from '@/stores/interface'
import { ElMessage, ElDropdown, ElMessageBox } from 'element-plus'

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

// 删除处理
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除 ${props.data.label} 吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    // await store.deleteNode(props.data.id)
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
