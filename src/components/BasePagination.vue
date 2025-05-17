<!-- BasePagination.vue -->
<template>
  <div class="pagination-container">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :layout="layout"
      background
      @current-change="$emit('page-change', $event)"
      @size-change="$emit('size-change', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  total: {
    type: Number,
    default: 0
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

defineEmits(['page-change', 'size-change'])
</script>

<style scoped>
.pagination-container {
  padding: 15px 0 15px 20px;
  flex-shrink: 0;
}
</style>