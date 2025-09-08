<template>
  <el-dialog
    :title="computedTitle"
    v-model="visible"
    width="500"
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
          <!-- 针对 el-select 兼容字符串或组件对象 -->
          <template v-if="isElSelect(field.component)">
            <component
              :is="getComponent(field.component)"
              v-model="formData[field.prop]"
              v-bind="field.attrs"
              @change="(val: any) => field.onSelectChange?.(val, field.prop)"
            >
              <template #default>
                <el-option
                  v-for="(option, index) in normalizedOptions(field.attrs?.options)"
                  :key="index"
                  :label="option.label"
                  :value="option.value"
                  :disabled="option.disabled"
                />
              </template>
            </component>
          </template>

          <!-- 其它组件（input/el-input/el-switch/自定义组件等） -->
          <template v-else>
            <component
              :is="getComponent(field.component) || 'div'"
              v-model="formData[field.prop]"
              v-bind="field.attrs"
            />
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
import { ref, reactive, computed, resolveComponent } from 'vue'
import type { FormInstance } from 'element-plus'
import {
  ElInput,
  ElSelect,
  ElOption,
  ElSwitch,
  ElInputNumber,
  ElDatePicker,
  ElRadio,
  ElCheckbox
} from 'element-plus'

interface DialogField {
  prop: string
  label: string
  component?: any // 支持字符串（'el-input'）或组件对象
  rules?: any[]
  attrs?: {
    options?: Array<{
      label: string
      value: any
      disabled?: boolean
    }>
  }
  onSelectChange?: (value: any, fieldProp?: string) => void
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
    return []
  }
  return options.map(opt => ({
    label: String(opt.label ?? ''),
    value: opt.hasOwnProperty('value') ? opt.value : opt.label,
    disabled: !!opt.disabled
  }))
}

const formRef = ref<FormInstance>()
const submitting = ref(false)

const visible = ref(false)
const mode = ref('add') // 当前模式：add 或 edit
const buttonText = computed(() => (mode.value === 'add' ? '添加' : '保存'))

// 修改初始化方式：使用深拷贝函数
const initFormData = () => {
  return props.fields.reduce((acc, field) => {
    acc[field.prop] = '' // 根据字段类型初始化默认值
    return acc
  }, {} as Record<string, any>)
}

// 动态初始化表单数据
const formData = reactive<Record<string, any>>(initFormData())

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
          formRef.value?.resetFields()
        }
      })
  } catch (error) {
    submitting.value = false
  }
}

const handleClosed = () => {
  formRef.value?.resetFields()
  Object.keys(formData).forEach(key => delete formData[key])
  Object.assign(formData, initFormData())
  visible.value = false
}

// 打开弹窗
const open = (dialogMode: 'add' | 'edit', data: Object) => {
  mode.value = dialogMode
  Object.keys(formData).forEach(key => delete formData[key])
  Object.assign(formData, initFormData()) // 重新初始化
  if (data) Object.assign(formData, data) // 合并传入数据
  visible.value = true
}

// 常用 Element Plus 组件映射（优先使用，避免依赖全局注册）
const componentMap: Record<string, any> = {
  'el-input': ElInput,
  'input': ElInput,
  'ElInput': ElInput,
  'el-select': ElSelect,
  'select': ElSelect,
  'ElSelect': ElSelect,
  'el-option': ElOption,
  'el-switch': ElSwitch,
  'el-input-number': ElInputNumber,
  'el-date-picker': ElDatePicker,
  'el-radio': ElRadio,
  'el-checkbox': ElCheckbox
}

// 解析组件：支持字符串（如 'el-input' / 'ElInput'）或直接传入组件对象
function getComponent(comp: any) {
  if (!comp) return null
  // 直接传入组件对象
  if (typeof comp !== 'string') return comp
  const key = String(comp)
  // 先查映射
  if (componentMap[key]) return componentMap[key]
  const lower = key.toLowerCase()
  if (componentMap[lower]) return componentMap[lower]
  // fallback：尝试 resolveComponent（若在父级注册过）
  try {
    return resolveComponent(key)
  } catch (e) {
    return comp // 最后退回字符串，template 会尽量渲染（可能为原生标签）
  }
}

// 判断是否为 el-select（字符串或组件对象）
function isElSelect(comp: any) {
  if (!comp) return false
  if (typeof comp === 'string') {
    const name = comp.toLowerCase()
    return name === 'el-select' || name === 'select' || name === 'elselect'
  }
  return comp?.name === 'ElSelect'
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


