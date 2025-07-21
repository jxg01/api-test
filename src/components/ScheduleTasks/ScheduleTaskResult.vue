<template>
  <div class="schedule-task-result" style="padding: 24px;">
    <el-empty v-if="!task" description="请选择左侧任务" />
    <div v-else>
      <h3>{{ task.name }} 执行结果</h3>
      <!-- 这里展示任务执行结果内容 -->
      <div>任务类型：{{ task.task_type }}</div>
      <div>表达式：{{ task.cron }}</div>
      <div>状态：<el-tag :type="task.enabled ? 'success' : 'danger'">{{ task.enabled ? '启用' : '禁用' }}</el-tag></div>
      <!-- 可扩展更多内容 -->
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ task: any }>()
</script>