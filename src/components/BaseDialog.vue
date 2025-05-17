<template>
  <el-dialog
    :title="computedTitle"
    v-model="visible"
    width="600px"
    @closed="handleClosed"
  >
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="rules" 
      label-width="100px"
       class="common-form"
    >
      <template v-for="field in fields" :key="field.prop">
        <el-form-item 
          :label="field.label" 
          :prop="field.prop"
        >
          <template v-if="field.component.name === 'ElSelect'">
            <el-select v-model="formData[field.prop]" v-bind="field.attrs" @change="field.onSelectChange(formData[field.prop])">
              <template #default>
                <el-option
                  v-for="(option, index) in normalizedOptions(field.attrs?.options)"
                  :key="index"
                  :label="option.label"
                  :value="option.value"
                  :disabled="option.disabled"
                />
              </template>
            </el-select>
          </template>
          <template v-else>
            <component
              :is="field.component || 'div'"
              v-model="formData[field.prop]"
              v-bind="field.attrs"
              >
            </component>
          </template>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="handleClosed">取消</el-button>
      <el-button 
        type="primary" 
        :loading="submitting" 
        @click="handleSubmit"
      >
        {{ buttonText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import type { FormInstance } from 'element-plus'

interface DialogField {
  prop: string
  label: string
  component?: string
  rules?: any[]
  attrs?: {
    options?: Array<{
      label: string
      value: any
    }>
  }
  onSelectChange?: (value: any, fieldProp: string) => void // 新增回调类型
}

const props = defineProps({
  title: String,
  fields: {
    type: Array as () => DialogField[],
    required: true
  },
  rules: Object
})

const emit = defineEmits(['submit', 'update:visible'])

// 新增选项标准化方法
const normalizedOptions = (options: any) => {
  if (!Array.isArray(options)) {
    console.warn('Select options 必须是数组')
    return []
  }
  return options.map(opt => ({
    label: String(opt.label || ''),
    value: opt.hasOwnProperty('value') ? opt.value : opt.label,
    disabled: !!opt.disabled
  }))
}



const formRef = ref<FormInstance>()
const submitting = ref(false)

const visible = ref(false)
const mode = ref('add') // 当前模式：add 或 edit
const buttonText = computed(() => (mode.value === 'add' ? '添加' : '保存'))

// 初始化默认数据结构
const defaultFormData = reactive<Record<string, any>>({})

// 动态初始化表单数据
const formData = reactive<Record<string, any>>({ ...defaultFormData })

const computedTitle = computed(() => 
  (mode.value === 'add' ? '新增' : '编辑') + props.title
)

const handleSubmit = async () => {
  try {
    submitting.value = true
    await formRef.value?.validate()
    emit('submit', { ...formData }, mode.value, (success: boolean) => {
        submitting.value = false
        if (success) {
          visible.value = false
        }
      })
  } catch (error) {
    submitting.value = false
  }
}

const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, defaultFormData)
  visible.value = false
}

  // 打开弹窗
  const open = (dialogMode: 'add' | 'edit', data: Object) => {
    mode.value = dialogMode
    // 重置为默认值
    Object.assign(formData, defaultFormData)
    // 合并传入数据
    if (data) Object.assign(formData, data)
    visible.value = true
  }


  defineExpose({ open })

</script>

<style scoped>
.common-form .el-form-item__content {
  width: 400px; /* 控制表单内容区宽度 */
}

/* 在 BaseDialog.vue 中添加 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select__tags) {
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>


