<template>
  <div class="assertion-fields">
    <template v-if="type === 'status_code'">
      <el-input
        v-model="model.expected"
        type="number"
        placeholder="期望状态码"
      />
    </template>

    <template v-if="type === 'jsonpath'">
      <el-input
        v-model="model.path"
        placeholder="JSONPath表达式"
      />
      <el-input
        v-model="model.expected"
        placeholder="期望值"
      />
    </template>

    <template v-if="type === 'response_time'">
      <el-input
        v-model="model.expected"
        type="number"
        placeholder="最大响应时间(ms)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps({
  model: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true
  }
})
</script>
