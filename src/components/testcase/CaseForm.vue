<template>
  <div>
    <el-form
      :model="localCaseDetail"
      ref="formRef"
      label-width="100px"
      class="case-detail-form"
    >
      <el-card shadow="hover">
        <!-- <el-form-item label="用例ID" prop="id">
          <el-input v-model="localCaseDetail.id" disabled />
        </el-form-item> -->
        <el-form-item label="用例名称" prop="name" required>
          <el-input v-model="localCaseDetail.name" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="localCaseDetail.enabled">
            <el-radio :value="true">启用</el-radio>
            <el-radio :value="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用例描述" prop="description">
          <el-input v-model="localCaseDetail.description" type="textarea" />
        </el-form-item>
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" type="border-card">
          <!-- Headers 标签页 -->
          <el-tab-pane label="请求头" name="headers">
            <key-value-editor
              :items="localCaseDetail.headers"
              @update:items="updateHandler('headers', $event)"
              key-placeholder="Header名称"
              value-placeholder="Header值"
            />
          </el-tab-pane>
    
          <!-- Params 标签页 -->
          <el-tab-pane label="参数" name="params">
            <key-value-editor
              :items="localCaseDetail.params"
              @update:items="updateHandler('params', $event)"
              key-placeholder="Header名称"
              value-placeholder="Header值"
            />
          </el-tab-pane>

          <!-- body 标签页 -->
          <el-tab-pane label="请求体" name="body">
            <key-value-editor
              :items="localCaseDetail.body"
              @update:items="updateHandler('body', $event)"
              key-placeholder="Header名称"
              value-placeholder="Header值"
            />
          </el-tab-pane>
          <!-- <el-form-item label="断言" prop="assertions">
            <el-input v-model="localCaseDetail.assertions" />
            <el-input
              v-model="localCaseDetail.assertions"
              style="max-width: 600px"
              placeholder="Please input"
              class="input-with-select"
            >
              <template #prepend>
                <el-select v-model="select" placeholder="Select" style="width: 115px">
                  <el-option label="Restaurant" value="1" />
                  <el-option label="Order No." value="2" />
                  <el-option label="Tel" value="3" />
                </el-select>
              </template>
              <template #append>
                <el-button :icon="Search" />
              </template>
            </el-input>
          </el-form-item> -->
          <el-form-item label="参数提取" prop="variable_extract">
            <el-input v-model="localCaseDetail.variable_extract" />
          </el-form-item>


          <el-form-item>
            <AssertionEditor
              :assertions="localCaseDetail.assertions"
              label="接口断言"
              :field-components="assertionFields"
            />
          </el-form-item>
          <!-- <el-form-item>
            <ExtractEditor
              :extracts="localCaseDetail.variable_extract"
              label="参数提取"
              :field-components="extractFields"
            />
          </el-form-item> -->






          <el-form-item>
            <el-button type="primary" @click="submit">保存</el-button>
          </el-form-item>
        </el-tabs>
        


      </el-card>
         

      

    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, reactive } from 'vue'
import type { DialogContext, FormInstance, FormRules } from 'element-plus'
import KeyValueEditor from '@/components/interface/KeyValueEditor.vue'
import { useCaseStore, TestCase } from '@/stores/testcase'
import AssertionEditor from './AssertionEditor.vue'
import AssertionFields from './AssertionFields.vue'
// import ExtractEditor from './ExtractEditor.vue'

const assertionFields = {
  status_code: AssertionFields,
  jsonpath: AssertionFields,
  response_time: AssertionFields
}

const extractFields = {
  regex: AssertionFields,
  jsonpath: AssertionFields
}


const props = defineProps<{
  formData: TestCase
}>()

const localCaseDetail = reactive<TestCase>({
  id: props.formData.id,
  name: props.formData.name,
  description: props.formData.description,
  enabled: props.formData.enabled,
  
  headers: props.formData.headers ? JSON.parse(JSON.stringify(props.formData.headers)) : {},
  params: props.formData.params ? JSON.parse(JSON.stringify(props.formData.params)) : {},
  body: props.formData.body ? JSON.parse(JSON.stringify(props.formData.body)) : {},

  assertions: props.formData.assertions,
  variable_extract: props.formData.variable_extract,
})

 // 更新处理器（添加防抖）
 let updateLock = false
  const updateHandler = (type: 'headers' | 'params' | 'body', value: Record<string, string>) => {
    if (updateLock) return
    
    updateLock = true
    nextTick().then(() => {
      localCaseDetail[type] = value
      updateLock = false
    })
  }

const activeTab = ref('headers')

const formRef = ref<FormInstance>()

const submit = async () => {
  try {
    await formRef.value?.validate()
    console.error('localCaseDetail:', localCaseDetail)
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

.case-detail-form {
  width: 70%;
  padding: 20px;
  margin: auto;
}
</style>
