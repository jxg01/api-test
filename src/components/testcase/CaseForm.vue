<template>
  <el-form
    :model="formData"
    :rules="rules"
    ref="formRef"
    label-width="100px"
  >
    <el-form-item label="用例ID" prop="id">
      <el-input v-model="formData.id" disabled />
    </el-form-item>
    <el-form-item label="用例名称" prop="name">
      <el-input v-model="formData.name" />
    </el-form-item>
    <el-form-item label="负责人" prop="owner">
      <el-select v-model="formData.owner" placeholder="请选择负责人">
        <el-option
          v-for="user in users"
          :key="user"
          :label="user"
          :value="user"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio
          v-for="(text, val) in statusText"
          :key="val"
          :label="Number(val)"
        >{{ text }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="用例描述" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="3"
      />
    </el-form-item>
    <el-form-item>
      <el-button @click="emit('cancel')">返回列表</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface TestCase {
  id: number | string
  name: string
  owner: string
  status: number
  description: string
}

const props = defineProps<{
  formData: TestCase
  users: string[]
  statusText: Record<number, string>
  rules: FormRules
}>()

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref<FormInstance>()

const submit = async () => {
  try {
    await formRef.value?.validate()
    emit('submit', props.formData)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.form-view {
  width: 90%;
  margin: 20px auto;
  padding: 20px;
  border: 2px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 3px 3px 15px #bca5be;
}
</style>