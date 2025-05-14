<template>
    <div class="key-value-viewer">
      <el-table :data="formattedData" style="width: 100%">
        <el-table-column prop="key" label="键" width="180" />
        <el-table-column prop="value" label="值" />
      </el-table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  const props = defineProps<{
    data?: Record<string, string>
  }>()
  
  const formattedData = computed(() => {
    return Object.entries(props.data || {}).map(([key, value]) => ({
      key,
      value
    }))
  })
  </script>
  