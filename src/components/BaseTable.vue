<template>
    <div class="common-table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        :height="height"
        highlight-current-row
      >
        <!-- 动态列渲染 -->
        <template v-for="column in columns" :key="column.prop">
          <el-table-column
            v-bind="column"
          >
            <!-- 支持自定义列内容 -->
            <template #default="scope" v-if="column.slot">
              <slot :name="column.slot" :row="scope.row"></slot>
            </template>
          </el-table-column>
        </template>
      </el-table>
  
      <!-- 分页组件 -->
      <el-pagination
        v-if="showPagination"
        :current-page="pagination.page"
        :page-size="pagination.size"
        :total="pagination.total"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :layout="paginationLayout"
        background
      />
    </div>
  </template>
  
  <script lang="ts" setup>
  import { PropType } from 'vue'
  
  // 列定义类型
  export interface TableColumn {
    prop: string
    label: string
    width?: string | number
    align?: 'left' | 'center' | 'right'
    slot?: string // 自定义插槽名称
    [key: string]: any // 其他 Element TableColumn 属性
  }
  
  // 分页配置类型
  interface PaginationConfig {
    page: number
    size: number
    total: number
  }
  
  const props = defineProps({
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
      default: 'calc(100vh - 220px)'
    },
    pagination: {
      type: Object as PropType<PaginationConfig>,
      default: () => ({
        page: 1,
        size: 20,
        total: 0
      })
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    }
  })
  
  const emit = defineEmits(['page-change', 'size-change'])
  
  const handlePageChange = (page: number) => {
    emit('page-change', page)
  }
  
  const handleSizeChange = (size: number) => {
    emit('size-change', size)
  }
  </script>
  
  <style scoped>
  .common-table-container {
    margin-top: 20px;
  }
  
  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
  </style>
