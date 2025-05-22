<!-- ExtractParamsEditor.vue -->
<template>
  <div class="params-editor">
    <div class="editor-header">
      <span class="title">参数提取配置</span>
      <el-button 
        type="primary" 
        size="small" 
        @click="addParam"
        icon="Plus"
      >
        添加提取规则
      </el-button>
    </div>

    <div class="params-list">
      <div 
        v-for="(param, index) in modelValue" 
        :key="index"
        class="param-item"
      >
        <div class="param-content">
          <!-- 变量名称 -->
          <el-input
            v-model="param.name"
            placeholder="变量名称"
            class="param-name"
            clearable
            :validate-event="false"
          >
            <template #prefix>
              <span class="var-prefix">$</span>
            </template>
          </el-input>

          <div class="separator">
            <el-icon><Right /></el-icon>
          </div>

          <!-- JSONPath表达式 -->
          <el-input
            v-model="param.path"
            placeholder="JSONPath表达式"
            class="jsonpath-input"
            clearable
          >
            <template #prepend>
              <span class="jsonpath-prefix">$.</span>
            </template>
          </el-input>

          <!-- 删除按钮 -->
          <el-button
            type="danger"
            circle
            :icon="Delete"
            class="delete-btn"
            @click="removeParam(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus, Right } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Array as PropType<Array<{ name: string; path: string }>>,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['update:model-value'])

// 添加参数规则
const addParam = () => {
  const newParams = [...props.modelValue, { name: '', path: '' }]
  emit('update:model-value', newParams)
}

// 删除参数规则
const removeParam = (index: number) => {
  const newParams = props.modelValue.filter((_, i) => i !== index)
  emit('update:model-value', newParams)
}
</script>

<style scoped>
.params-editor {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background: #fff;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-item {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  background: #f8f9fa;
  transition: all 0.2s;
}

.param-item:hover {
  border-color: #409eff;
}

.param-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.param-name {
  width: 220px;
  
  :deep(.el-input__inner) {
    padding-left: 28px;
  }
}

.var-prefix {
  color: #909399;
  margin-right: 4px;
}

.separator {
  color: #c0c4cc;
  padding: 0 8px;
}

.jsonpath-input {
  flex: 1;
  
  :deep(.el-input-group__prepend) {
    padding: 0 8px;
    background: #fff;
  }
}

.jsonpath-prefix {
  color: #67c23a;
  font-family: monospace;
}

.delete-btn {
  margin-left: 12px;
  flex-shrink: 0;
}
</style>