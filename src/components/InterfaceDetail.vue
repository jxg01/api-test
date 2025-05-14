<template>
    <div class="interface-detail">
      <el-descriptions title="接口详情" border :column="2">
        <el-descriptions-item label="接口名称">{{ data.name }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">
          <el-tag :type="methodType">{{ data.method }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求路径">{{ data.path }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="data.status === 1 ? 'success' : 'danger'">
            {{ data.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ data.description }}</el-descriptions-item>
      </el-descriptions>
  
      <el-tabs class="detail-tabs" v-model="activeTab">
        <el-tab-pane label="请求参数" name="params">
          <!-- 参数表格 -->
        </el-tab-pane>
        <el-tab-pane label="响应示例" name="response">
          <!-- 响应内容 -->
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { computed, ref } from 'vue'
  
  const props = defineProps({
    data: {
      type: Object,
      required: true
    }
  })
  
  const activeTab = ref('params')
  
  const methodType = computed(() => {
    const method = props.data.method?.toLowerCase()
    return method === 'get' ? 'primary' : 
           method === 'post' ? 'success' : 
           method === 'put' ? 'warning' : 
           method === 'delete' ? 'danger' : 'info'
  })
  </script>
  
  <style scoped>
  .detail-tabs {
    margin-top: 20px;
  }
  </style>
  