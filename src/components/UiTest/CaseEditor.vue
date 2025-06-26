<template>
  <div style="padding:24px 0 0 0">
    <el-form :model="localCaseData" label-width="80px" ref="caseForm" :rules="formRules">
      <el-form-item label="用例名" prop="name">
        <el-input v-model="localCaseData.name" @input="emitChange" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="localCaseData.description" @input="emitChange" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="localCaseData.enable" @change="emitChange">
          <el-radio :value=true size="large">启用</el-radio>
          <el-radio :value=false size="large">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 前置接口步骤区 -->
      <el-form-item label="前置接口">
        <el-card shadow="never" >
          <div
            v-for="(step, i) in localCaseData.pre_apis"
            :key="i"
            style="margin-bottom:12px;display:flex;flex-direction:column;gap:4px;padding:10px 0;border-bottom:1px dashed #eee"
          >
            <div style="display:flex;align-items:center;gap:8px;">
              <el-input v-model="step.url" placeholder="接口URL" style="width:210px;" @input="emitChange" :status="!step.url ? 'error':undefined"/>
              <el-select v-model="step.method" placeholder="方法" style="width:90px" @change="emitChange">
                <el-option label="POST" value="POST" />
                <el-option label="GET" value="GET" />
              </el-select>
              <!-- body编辑按钮与文本域 -->
              <el-input
                v-if="step.method === 'POST'"
                v-model="step.body"
                placeholder="请求体(原始JSON)"
                style="width:180px;"
                @input="emitChange"
                type="textarea"
                autosize
              />
              <el-button
                v-if="step.method === 'POST'"
                size="small"
                @click="openJsonEditor(i)"
                style="padding:0 6px"
              >JSON可视化</el-button>
              <el-button type="danger" size="small" @click="removePreApiStep(i)"><el-icon><Delete /></el-icon></el-button>
            </div>
            <!-- 多变量提取区 -->
            <div style="margin-left:12px;">
              <el-row v-for="(extract, k) in step.extracts" :key="k" style="margin-bottom:4px;align-items:center;">
                <el-col :span="6">
                  <el-input v-model="extract.varName" placeholder="变量名" @input="emitChange" :status="!extract.varName ? 'error':undefined"/>
                </el-col>
                <el-col :span="14" style="margin-left:10px;">
                  <el-input v-model="extract.jsonPath" placeholder="JsonPath如$.access_token" @input="emitChange" :status="!extract.jsonPath || !extract.jsonPath.startsWith('$') ? 'error':undefined"/>
                </el-col>
                <el-col :span="1" style="margin-left:6px;">
                  <el-button type="danger" size="small" @click="removeExtract(i, k)" ><el-icon><Delete /></el-icon></el-button>
                </el-col>
              </el-row>
              <el-button type="success" size="small" @click="addExtract(i)">添加提取变量</el-button>
            </div>
          </div>
          <el-button type="primary" size="small" @click="addPreApiStep">添加前置接口</el-button>
        </el-card>
      </el-form-item>

      <!-- 主流程步骤区（拖拽） -->
      <el-form-item label="主流程步骤">
        <draggable
          v-model="localCaseData.steps"
          handle=".drag-handle"
          animation="200"
          item-key="__uuid"
          @end="emitChange"
        >
          <template #item="{element: row, index: $index}">
            <div class="main-step">
              <span class="drag-handle" style="cursor:move;font-size:18px;user-select:none;">⠿</span>
              <el-select v-model="row.action" style="width:150px" @change="emitChange">
                <el-option v-for="a in stepActions" :key="a.value" :label="a.label" :value="a.value" />
              </el-select>
              <el-input
                v-if="row.action === 'goto'"
                v-model="row.url"
                placeholder="URL"
                style="width:80%"
                @input="emitChange"
              />
              <el-input
                v-if="row.action === 'set_header'"
                v-model="row.header"
                placeholder='Header JSON'
                style="width:80%"
                @input="emitChange"
              />
              <template v-if="row.action === 'assert_text'">
                <el-input
                  v-model="row.selector"
                  placeholder="选择器"
                  style="width:40%"
                  @input="emitChange"
                />
                <el-input
                  v-model="row.expect"
                  placeholder="期望文本"
                  style="width:40%"
                  @input="emitChange"
                />
              </template>

              <template v-if="row.action === 'click'">
                <el-select v-model="row.selector" placeholder="选择或输入元素选择器" filterable allow-create  @change="emitChange">
                  <el-option
                    v-for="op in pageOptions"
                    :key="op.label"
                    :label="op.label"
                    :value="op.value"
                  />
                  
                </el-select>
              </template>
              <el-button type="danger" size="small" @click="removeStep($index)" ><el-icon><Delete /></el-icon></el-button>
            </div>
          </template>
        </draggable>
        
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" style="" @click="addStep">添加步骤</el-button>
      </el-form-item>
      <!-- 后置处理步骤区 -->
      <el-form-item label="后置处理">
        <el-card shadow="never" >
          <div
            v-for="(step, i) in localCaseData.post_steps"
            :key="i"
            style="margin-bottom:12px;display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px dashed #eee"
          >
            <el-select v-model="step.type" style="width:90px" @change="emitChange">
              <el-option label="SQL" value="sql" />
              <!-- <el-option label="接口" value="api" />
              <el-option label="Shell" value="shell" /> -->
            </el-select>
            <!-- SQL类型 -->
            <template v-if="step.type === 'sql'">
              <el-input v-model="step.sql" placeholder="SQL语句" style="width:220px" @input="emitChange" />
              <!-- <el-input v-model="step.dbEnv" placeholder="数据库环境/别名" style="width:120px" @input="emitChange" /> -->
            </template>
            <!-- API类型 -->
            <template v-if="step.type === 'api'">
              <el-input v-model="step.apiUrl" placeholder="接口URL" style="width:180px" @input="emitChange" />
              <el-select v-model="step.apiMethod" placeholder="方法" style="width:70px" @change="emitChange">
                <el-option label="POST" value="POST" />
                <el-option label="GET" value="GET" />
              </el-select>
              <el-input
                v-model="step.apiBody"
                placeholder="请求体(JSON)"
                style="width:140px;"
                type="textarea"
                autosize
                @input="emitChange"
              />
            </template>
            <!-- Shell类型 -->
            <template v-if="step.type === 'shell'">
              <el-input v-model="step.shellCmd" placeholder="Shell命令" style="width:220px" @input="emitChange" />
            </template>
            <el-button type="danger" size="small" @click="removePostStep(i)" ><el-icon><Delete /></el-icon></el-button>
          </div>
          <el-button type="primary" size="small" @click="addPostStep">添加后置步骤</el-button>
        </el-card>
      </el-form-item>
    </el-form>
    <div style="margin:18px 0">
      <el-button type="primary" @click="onSave">保存</el-button>
      <el-button type="success" @click="onRun">调试运行</el-button>
    </div>

    <!-- JSON编辑弹窗 -->
    <el-dialog v-model="jsonEditor.visible" title="编辑JSON Body" width="450px">
      <el-input
        v-model="jsonEditor.value"
        type="textarea"
        :autosize="{minRows: 8}"
        placeholder='请输入合法JSON'
      />
      <template #footer>
        <el-button type="warning" style="float: left;">格式化</el-button>
        <el-button @click="jsonEditor.visible=false">取消</el-button>
        <el-button type="primary" @click="confirmJsonEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick, computed, reactive } from 'vue'
import Draggable from 'vuedraggable'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { fa } from 'element-plus/es/locale'

type ExtractVar = { varName: string, jsonPath: string }
type PreApiStep = {
  url: string
  method: string
  body?: string
  extracts: ExtractVar[]
}
type PostStep = {
  type: 'sql' | 'api' | 'shell',
  sql?: string,
  dbEnv?: string,
  apiUrl?: string,
  apiMethod?: string,
  apiBody?: string
  shellCmd?: string
}
type Step = {
  action: string,
  url?: string,
  selector?: string,
  header?: string,
  expect?: string
  __uuid?: string
}
type CaseData = {
  id: string,
  name: string,
  description: string,
  pre_apis: PreApiStep[],
  steps: Step[]
  post_steps: PostStep[]
  enable: boolean
}

const props = defineProps<{
  caseData: CaseData
}>()
const emit = defineEmits(['update:caseData', 'save', 'run'])
const caseForm = ref<FormInstance>()
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '用例名称不能为空', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在2-30个字符', trigger: ['blur', 'change'] }
  ]
})
const stepActions = [
  { label: '设置Header', value: 'set_header' },
  { label: '跳转页面', value: 'goto' },
  { label: '点击', value: 'click' },
  { label: '断言文本', value: 'assert_text' },
  // { label: '上传文件', value: 'upload'}
]

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}
function fillUuid(list: Step[]) {
  list.forEach(s => { if (!s.__uuid) s.__uuid = randomId() })
}
const localCaseData = ref<CaseData>(JSON.parse(JSON.stringify(props.caseData || { id: '', name: '', description: '', pre_apis: [], steps: [],  })))
if (localCaseData.value.steps) fillUuid(localCaseData.value.steps)
if (!localCaseData.value.pre_apis) localCaseData.value.pre_apis = []
if (!localCaseData.value.post_steps) localCaseData.value.post_steps = []
localCaseData.value.pre_apis.forEach(p => { if (!p.extracts) p.extracts = [] })

watch(
  () => props.caseData,
  (val) => {
    localCaseData.value = JSON.parse(JSON.stringify(val || { id: '', name: '', description: '', pre_apis: [], steps: [] }))
    fillUuid(localCaseData.value.steps)
    if (!localCaseData.value.pre_apis) localCaseData.value.pre_apis = []
    localCaseData.value.pre_apis.forEach(p => { if (!p.extracts) p.extracts = [] })
  },
  { deep: true }
)
function emitChange() {
  emit('update:caseData', JSON.parse(JSON.stringify(localCaseData.value)))
}
function addStep() {
  const newStep: Step = { action: '', __uuid: randomId() }
  localCaseData.value.steps.push(newStep)
  emitChange()
}
function removeStep(idx: number) {
  localCaseData.value.steps.splice(idx, 1)
  emitChange()
}
function addPreApiStep() {
  localCaseData.value.pre_apis.push({
    url: '',
    method: 'POST',
    body: '',
    extracts: []
  })
  emitChange()
}
function removePreApiStep(idx: number) {
  localCaseData.value.pre_apis.splice(idx, 1)
  emitChange()
}
function addPostStep() {
localCaseData.value.post_steps.push({
  type: 'sql',
  sql: '',
  dbEnv: ''
})
emitChange()
}
function removePostStep(idx: number) {
localCaseData.value.post_steps.splice(idx, 1)
emitChange()
}

function addExtract(preIdx: number) {
  localCaseData.value.pre_apis[preIdx].extracts.push({ varName: '', jsonPath: '' })
  emitChange()
}
function removeExtract(preIdx: number, idx: number) {
  localCaseData.value.pre_apis[preIdx].extracts.splice(idx, 1)
  emitChange()
}

// ========== JSON编辑相关 ==========
const jsonEditor = ref({
  visible: false,
  value: '',
  preIdx: 0
})
function openJsonEditor(idx: number) {
  jsonEditor.value.preIdx = idx
  jsonEditor.value.value = localCaseData.value.pre_apis[idx].body || ''
  jsonEditor.value.visible = true
}
function confirmJsonEdit() {
  // 校验合法性
  try {
    if (jsonEditor.value.value.trim() !== '') {
      JSON.parse(jsonEditor.value.value)
    }
  } catch (e) {
    ElMessage.error('请输入合法JSON')
    return
  }
  localCaseData.value.pre_apis[jsonEditor.value.preIdx].body = jsonEditor.value.value
  jsonEditor.value.visible = false
  emitChange()
}

// ======= 校验函数 =======
const validateForm = async() => {
  // 基本项
  const v = await caseForm.value?.validate()
  if (!v) return false

  if (!localCaseData.value.name) {
    ElMessage.error('请输入用例名')
    return false
  }
  // 前置接口校验
  for (const [i, api] of localCaseData.value.pre_apis.entries()) {
    if (!api.url) {
      ElMessage.error(`第${i + 1}个前置接口URL不能为空`)
      return false
    }
    if (!api.method) {
      ElMessage.error(`第${i + 1}个前置接口请求方法不能为空`)
      return false
    }
    for (const [k, ext] of (api.extracts || []).entries()) {
      if (!ext.varName) {
        ElMessage.error(`第${i + 1}个前置接口的第${k + 1}个变量名不能为空`)
        return false
      }
      if (!ext.jsonPath || !ext.jsonPath.startsWith('$')) {
        ElMessage.error(`第${i + 1}个前置接口的第${k + 1}个JsonPath不合法`)
        return false
      }
    }
    // JSON格式校验
    if (api.method === 'POST' && api.body) {
      try { JSON.parse(api.body) } catch (e) {
        ElMessage.error(`第${i + 1}个前置接口Body不是合法JSON`)
        return false
      }
    }
  }
  return true
}


const pageOptions = computed(() => {
return [
{label: '登录按钮', value: '//*[@id="login"]'},
{label: '用户名输入框', value: '//*[@id="login1"]'}
]
})












async function onSave() {
  try {
    const isValid = await validateForm(); // 等待校验结果
    if (!isValid) return; // 如果校验失败，直接返回
    emit('save'); // 触发父组件的 save 方法
  } catch (error) {
    console.error('保存失败:', error);
  }
}

async function onRun() {
  try {
    const isValid = await validateForm(); // 等待校验结果
    if (!isValid) return; // 如果校验失败，直接返回
    emit('run'); // 触发父组件的 save 方法
  } catch (error) {
    console.error('保存失败:', error);
  }
}
</script>

<style scoped>
.main-step {
display:flex;
align-items:center;
gap:6px;
margin-bottom:8px;
/* width: 100%;
min-width: 400px;
max-width: 800px; */
width: 700px;
}




</style>
