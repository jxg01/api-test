<!-- BaseTable.vue -->
<template>
  <div class="table-container">
    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      :height="height"
      highlight-current-row
      v-bind="$attrs"
      show-overflow-tooltip
    >
      <template v-for="column in columns" :key="column.prop">
        <el-table-column v-bind="column">
          <template #default="scope" v-if="column.slot">
            <slot :name="column.slot" :row="scope.row" :$index="scope.$index"></slot>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  slot?: string
  [key: string]: any
}

defineProps({
  columns: {
    type: Array as PropType<TableColumn[]>,
    required: true
  },
  tableData: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  height: {
    type: String,
    // default: 'calc(100vh - 200px)'
    default: 'calc(100vh - 280px)'
  }
})
</script>

<style scoped>
.table-container {
  flex: 1;
  min-height: 0;
}
</style>