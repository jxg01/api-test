
<template>
  <div>
    <el-dialog v-model="props.visible" title="测试套件" @close="emit('close')">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="选择用例">
          <el-select v-model="form.cases" multiple filterable style="width: 100%">
            <el-option
              v-for="c in allCases"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="emit('close')">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import type { Suite, TestCase } from '@/stores/suiteStore'

const dialogVisit = ref(false)

const props = defineProps<{
  visible: boolean
  suite: Suite | null
  allCases: TestCase[]
}>()

const emit = defineEmits(['close', 'save'])

const form = reactive<Suite>({
  name: '',
  description: '',
  execution_status: 'Pending',
  cases: []
})

watch(
  () => props.suite,
  (suite) => {
    if (suite) {
      Object.assign(form, suite)
    } else {
      Object.assign(form, {
        name: '',
        description: '',
        execution_status: 'Pending',
        cases: []
      })
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  await emit('save', { ...form })
  emit('close')
}
</script>

