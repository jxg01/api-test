<!-- AssertionEditor.vue -->
<template>
  <div class="assertion-editor">
    <div class="editor-header">
      <span class="label">{{ label }}</span>
      <el-button type="primary" plain size="small" @click="addItem">
        {{ addButtonText }}
      </el-button>
    </div>

    <div class="items-container">
      <div v-for="(item, index) in assertions" :key="index" class="item-wrapper">
        <div class="item-content">
          <!-- 类型选择 -->
          <el-select
            v-model="item.type"
            :placeholder="typePlaceholder"
            class="type-select"
            @change="handleTypeChange(index)"
          >
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <!-- 动态字段 -->
          <template v-if="item.type">
            <component
              :is="getFieldComponent(item.type)"
              v-model="item"
              class="dynamic-fields"
              @update:model-value="emitUpdate"
            />
          </template>

          <!-- 删除按钮 -->
          <el-button
            type="danger"
            circle
            :icon="Delete"
            class="delete-btn"
            @click="removeItem(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  assertions: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    default: '断言配置'
  },
  addButtonText: {
    type: String,
    default: '添加断言'
  },
  typeOptions: {
    type: Array,
    default: () => [
      { value: 'status_code', label: '状态码' },
      { value: 'jsonpath', label: 'JSONPath' },
      { value: 'response_time', label: '响应时间' }
    ]
  },
  typePlaceholder: {
    type: String,
    default: '选择断言类型'
  },
  fieldComponents: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:model-value'])

// 添加新条目
const addItem = () => {
  const newItem = {
    type: '',
    expected: '',
    path: '',
    expression: ''
  }
  emit('update:model-value', [...props.assertions, newItem])
}

// 删除条目
const removeItem = (index: number) => {
  const newItems = props.assertions.filter((_, i) => i !== index)
  emit('update:model-value', newItems)
}

// 类型变化处理
const handleTypeChange = (index: number) => {
  const item = props.assertions[index]
  // 重置无关字段
  item.path = ''
  item.expression = ''
  item.expected = ''
}

// 获取对应的字段组件
const getFieldComponent = (type: string) => {
  return props.fieldComponents[type] || null
}

// 触发更新事件
const emitUpdate = () => {
  emit('update:model-value', props.assertions)
}
</script>

<style scoped>
.assertion-editor {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.label {
  font-weight: 600;
  color: #606266;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-wrapper {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  background: #f8f9fa;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-select {
  width: 180px;
}

.dynamic-fields {
  flex: 1;
  display: flex;
  gap: 8px;
}

.delete-btn {
  margin-left: auto;
}
</style>