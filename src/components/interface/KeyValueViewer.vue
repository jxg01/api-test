<template>
    <div class="key-value-viewer">
      <el-table :data="formattedData" style="width: 100%" empty-text="暂无数据">
        <el-table-column prop="key" :label="props.keyLabel || '键'" :width="props.width || 180" />
        <el-table-column prop="value" :label="props.valueLabel || '值'" />
      </el-table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  const props = defineProps<{
    data?: Record<string, string>
    width?: number
    keyLabel?: string
    valueLabel?: string
  }>()
  
  const formattedData = computed(() => {
    return Object.entries(props.data || {}).map(([key, value]) => ({
      key,
      value
    }))
  })
  </script>
  