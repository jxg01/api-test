<template>
  <VAceEditor
    ref="editorRef"
    v-model:value="model"
    :lang="lang"
    :theme="theme"
    :options="mergedOptions"
    :style="`height:${height};width:${width};border-radius:8px;border:1px solid #eee;`"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { VAceEditor } from 'vue3-ace-editor'
// 动态加载 ace-builds 相关资源
import ace from 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/theme-twilight'

const props = withDefaults(defineProps<{
  modelValue?: string
  lang: string    // 语言：'python'、'json'、'javascript' 等
  height?: string // 编辑器高度，如'400px'
  width?: string,
  theme?: string  // 主题名，如'monokai'
  options?: any   // 可选扩展选项
  additionalValues?: string []
}>(), {
  height: '400px',
  theme: 'monokai',
})

const emit = defineEmits(['update:modelValue'])

const model = ref(props.modelValue ?? '')

watch(() => props.modelValue, (val) => {
  if (val !== model.value) model.value = val || ''
})

watch(model, (val) => {
  emit('update:modelValue', val)
})

const editorRef = ref()

// Ace模式名映射（可扩展）
const modeMap: Record<string, string> = {
  json: 'json',
  python: 'python',
  javascript: 'javascript',
  js: 'javascript',
  ts: 'typescript',
  text: 'text',
}
// 默认基础options
const baseOptions = {
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  fontSize: 16,
  tabSize: 2,
  useWorker: false, // 防止部分mode报错
  wrap: true,    // 超过长度，自动换行
}

const mergedOptions = { ...baseOptions, ...(props.options || {}) }

onMounted(() => {
  console.log('mergedOptions', mergedOptions)
  if (props.lang === 'python') {
    ace.require('ace/ext/language_tools').addCompleter({
      getCompletions(editor: any, session: any, pos: any, prefix: any, callback: any) {
        if (prefix && prefix.length > 0) {
          const PYTHON_BUILTINS = props.additionalValues? props.additionalValues : [
            "print", "len", "range", "list", "dict", "set", "str", "int", "float",
            "sum", "input", "open", "type", "help", "dir", "abs", "all", "any", "bool",
            "isinstance", "enumerate", "reversed", "max", "min", "sorted", "zip", "map",
            "filter", "format", "id", "ord", "chr", "hex", "bin", "oct", "eddy_test"
          ]
          const completions = PYTHON_BUILTINS
            .filter(name => name.toLowerCase().includes(prefix.toLowerCase()))
            .map(name => ({
              caption: name,
              value: name,
              meta: "python built-in",
              score: 1000,
            }))
          callback(null, completions)
        } else {
          callback(null, [])
        }
      }
    })
  }
  else if (props.lang === 'json') {
    ace.require('ace/ext/language_tools').addCompleter({
      getCompletions(editor: any, session: any, pos: any, prefix: any, callback: any) {
        if (prefix && prefix.length > 0) {
          const completions = props.additionalValues?.filter(name => name.toLowerCase().includes(prefix.toLowerCase()))
            .map(name => ({
              caption: name,
              value: name,
              meta: "Customize Func",
              score: 1000,
            })) || []
          callback(null, completions)
        } else {
          callback(null, [])
        }
      }
    })
  }
})
</script>
