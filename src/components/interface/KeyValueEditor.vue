<template>
    <div class="key-value-editor">
      <el-table :data="localItems" style="width: 100%" :max-height="tableMaxHeight" empty-text="暂无数据">
        <el-table-column prop="key" width="200">
          <template #header>
            <el-button
                type="primary"
                size="small"
                @click="addRow"
                icon="Plus"
              />
            <!-- <div class="flex justify-between">
              
              <span>键</span>
            </div> -->
          </template>
          <template #default="{ $index }">
            <el-input v-model="localItems[$index].key" placeholder="key" />
          </template>
        </el-table-column>
  
        <el-table-column prop="value">
          <!-- <template #header>
            <span>值</span>
          </template> -->
          <template #default="{ $index }">
            <div class="value-cell">
              <el-input v-model="localItems[$index].value" placeholder="value" />
              <el-button
                type="danger"
                size="small"
                @click="deleteRow($index)"
                icon="Delete"
                circle
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, nextTick, computed } from 'vue'

interface KeyValueItem {
  key: string
  value: string
}

const props = defineProps<{
  items?: Record<string, string>
}>()

const emit = defineEmits(['update:items'])

const localItems = ref<KeyValueItem[]>([])

// 深度转换初始化
const convertToArray = (obj?: Record<string, string>) => {
  return Object.entries(obj || {}).map(([key, value]) => ({ key, value }))
}

// 单向数据流处理
let internalUpdate = false
watch(() => props.items, (newVal) => {
  if (internalUpdate) {
    internalUpdate = false
    return
  }
  localItems.value = convertToArray(newVal)
}, { deep: true, immediate: true })

// 防抖更新
watch(localItems, (newVal) => {
  internalUpdate = true
  nextTick().then(() => {
    const result = newVal.reduce((acc: Record<string, string>, item) => {
      if (item.key) {
        acc[item.key] = item.value
      }
      return acc
    }, {})
    emit('update:items', result)
  })
}, { deep: true })
const addRow = () => {
  localItems.value.push({ key: '', value: '' })
}

const deleteRow = (index: number) => {
  localItems.value.splice(index, 1)
}

 // 计算最大高度（当行数≥6时，限制为5行高度以触发滚动条）
const tableMaxHeight = computed(() => {
  const ROW_HEIGHT = 40; // 根据实际行高调整此值
  return localItems.value.length >= 5 ? ROW_HEIGHT * 8 : null;
});
  </script>
  
  <style scoped>
  .value-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  :deep(.el-table th) {
    background: #f5f7fa;
  }
  </style>
