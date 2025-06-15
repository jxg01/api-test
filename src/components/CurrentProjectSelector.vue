<template>
  <el-select
      v-model="currentProjectId"
      placeholder="选择项目"
      @change="handleChange"
      size="large"
      width="100%"
      class="current-project-selector"
    >
      <el-option
        v-for="project in projectList"
        :key="project.id"
        :label="project.name"
        :value="project.id"
      />
    </el-select>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import type { Project } from '@/types/project'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()

const store = useProjectStore()
const projectList = ref<Project[]>([])
const currentProjectId = ref<number | null>(null)

onMounted(async () => {
  const res = await store.fetchProjectList()
  projectList.value = res

  const savedId = localStorage.getItem('currentProjectId')
  const matchedProject = res.find(p => p.id === Number(savedId))

  if (matchedProject) {
    currentProjectId.value = matchedProject.id
    store.setCurrent(matchedProject)
  } else {
    currentProjectId.value = res[0]?.id || null
    if (res[0]) store.setCurrent(res[0])
  }
})

const handleChange = async (id: number) => {
  const project = projectList.value.find(p => p.id === id)
  if (project) {
    store.setCurrent(project)
    localStorage.setItem('currentProjectId', id.toString())
    router.push('/dashboard')
  }
}



</script>
