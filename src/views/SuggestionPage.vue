<template>
  <div class="suggestion-page">
    <BaseTable
      :columns="tableColumns"
      :data="tableData"
      :loading="false"
      :empty-text="'暂无数据'"
      :show-pagination="false"
      height="calc(100vh - 170px)"
    />

    <BasePagination
      :current-page="pagination.page"
      :page-size="pagination.size"
      :total="pagination.total"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>


<script setup lang="ts">
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import { ref, onMounted, watch, computed, reactive } from 'vue'
import BasePagination from '@/components/BasePagination.vue'
import { userApi } from '@/api'


const tableColumns: TableColumn[] = [
  { prop: 'id', label: '#', width: 60 },
  { prop: 'content', label: '建议信息' },
  { prop: 'created_by', label: '创建人', width: 180 },
  { prop: 'created_at', label: '创建时间', width: 180 },
  // { prop: 'operation', label: '操作', width: 130, slot: 'operation' }
]

const tableData = ref([])

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchSuggestionList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchSuggestionList()
}

const fetchSuggestionList = async () => {
  console.log('Fetching suggestion list...')
  try {
    const res = await userApi.getUserSuggestionList({
      page: pagination.page,
      size: pagination.size
    })
    if (res) {
      tableData.value = res.data || []
      pagination.total = res.meta.pagination.total || 0
      pagination.page = res.meta.pagination.page || 0
      pagination.size = res.meta.pagination.per_page || 0
    }
  } catch (error) {
    console.error('Error fetching suggestion list:', error)
  }
}

onMounted(() => {
  fetchSuggestionList()
})


</script>

<style scoped>

:deep(.el-popper) {
  max-width: 400px !important; /* 自定义最大宽度 */
}

.suggestion-page {
  background: #dddddd;
}

</style>
