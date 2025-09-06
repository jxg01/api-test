<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'

const projectStore = useProjectStore()

// 下拉数据直接来自 store
const projectList = computed(() => projectStore.projectList)

// v-model 直接双向到 store.currentProjectId
const currentProjectId = computed<number | null>({
  get: () => projectStore.currentProjectId as number | null,
  set: (id) => { if (id != null) projectStore.setCurrentById(id) }
})

// 对外暴露 change 事件（是否跳转交给父组件决定）
const emit = defineEmits<{ (e:'changed', id:number|null): void }>()

onMounted(async () => {
  await projectStore.ensureReady()
})

function handleChange(id: number) {
  emit('changed', id)
}
</script>

<template>
  <el-select
    v-model="currentProjectId"
    placeholder="选择项目"
    size="large"
    class="current-project-selector"
    @change="handleChange"
  >
    <el-option
      v-for="p in projectList"
      :key="p.id"
      :label="p.name"
      :value="p.id"
    />
  </el-select>
</template>
