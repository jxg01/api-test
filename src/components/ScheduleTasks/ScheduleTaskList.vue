<template>
  <div class="schedule-task-list">
    <el-card shadow="never" class="toolbar-card">
      <el-button type="primary" :icon="Plus" @click="$emit('add')">新建任务</el-button>
    </el-card>
    <el-scrollbar style="height: calc(100vh - 80px);">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-item"
        :class="{ active: selectedId === task.id }"
        @click="selectTask(task)"
      >
        <el-tooltip :content="task.name" placement="top" effect="dark">
          <span class="task-name">{{ task.name }}</span>
        </el-tooltip>
        <div class="task-actions" @click.stop>
          <el-switch
            v-model="task.enabled"
            @change="toggleTask(task)"
            size="small"

          />
          <el-button link type="primary" :icon="Edit" @click.stop="$emit('edit', task)" />
          <el-button link type="danger" :icon="Delete" @click.stop="$emit('delete', task)" />
          <!-- <el-button link type="primary" :icon="Edit" @click.stop="$emit('edit', task)">编辑</el-button>
          <el-button link type="danger" :icon="Delete" @click.stop="$emit('delete', task)">删除</el-button> -->
        </div>
      </div>
      <el-empty v-if="!tasks?.length && !loading" description="暂无任务" />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps<{ tasks: any[], loading?: boolean }>()
const emit = defineEmits(['edit', 'delete', 'select', 'add'])
const selectedId = ref<number | null>(null)
function selectTask(task: any) {
  selectedId.value = task.id
  emit('select', task)
}
function toggleTask(task: any) {
  // 可选：调用接口切换任务状态
  emit('edit', { ...task, enabled: !task.enabled })
}
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 15px;
  min-height: 44px;
}
.task-item.active {
  background: #e4e4f9;
}
.task-name {
  max-width: 400px;
  font-weight: 500;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  letter-spacing: 0.5px;
}
.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-card {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
