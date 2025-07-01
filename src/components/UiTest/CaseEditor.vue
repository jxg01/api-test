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
              <el-select v-model="step.name" placeholder="前置接口类型" style="width:120px;" @change="emitChange">
                <el-option label="登录" value="token" />
                <el-option label="其他" value="other" />
              </el-select>
              <el-input v-model="step.request.url" placeholder="接口URL" style="width:210px;" @input="emitChange" :status="!step.request.url ? 'error':undefined"/>
              <el-select v-model="step.request.method" placeholder="方法" style="width:90px" @change="emitChange">
                <el-option label="POST" value="POST" />
                <el-option label="GET" value="GET" />
              </el-select>
              <!-- body编辑按钮与文本域 -->
              <el-input
                v-if="step.request.method === 'POST'"
                v-model="step.request.body"
                placeholder="请求体(原始JSON)"
                style="width:180px;"
                @input="emitChange"
                type="textarea"
                autosize
              />
              <el-button
                v-if="step.request.method === 'POST'"
                size="small"
                @click="openJsonEditor(i)"
                style="padding:0 6px"
              >JSON可视化</el-button>
              <el-button type="danger" size="small" @click="removePreApiStep(i)"><el-icon><Delete /></el-icon></el-button>
            </div>
            <!-- 多变量提取区 -->
            <div style="margin-left:12px;">
              <el-row v-for="(extract, k) in step.extracts" :key="k" style="margin-bottom:4px;align-items:center;">
                <el-icon color="pink" :size="24"><SetUp /></el-icon>
                <el-col :span="6">
                  <el-input v-model="extract.varName" placeholder="变量名" @input="emitChange" :status="!extract.varName ? 'error':undefined"/>
                </el-col>
                <el-col :span="14" style="margin-left:10px;">
                  <el-input v-model="extract.jsonpath" placeholder="JsonPath如$.access_token" @input="emitChange" :status="!extract.jsonpath || !extract.jsonpath.startsWith('$') ? 'error':undefined"/>
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
      <el-form-item label="用例步骤">
        <draggable
          v-model="localCaseData.steps"
          handle=".drag-handle"
          animation="200"
          item-key="__uuid"
          @end="emitChange"
          style="width: 100%;"
        >
          <template #item="{element: row, index: $index}">
            <div class="main-step">
              <div style="color: blueviolet;">{{ $index+1 }}</div>
              <span class="drag-handle" style="cursor:move;font-size:30px;user-select:none;color:darkorchid;">⠿</span>
              <el-select v-model="row.action" style="min-width: 80px;max-width: 120px;" @change="emitChange">
                <el-option v-for="a in stepActions" :key="a.value" :label="a.label" :value="a.value" />
              </el-select>
              <el-input
                v-if="row.action === 'goto'"
                v-model="row.url"
                placeholder="URL"
                style="width:100%"
                @input="emitChange"
              />
              <template v-if="row.action === 'assert'">
                <el-select style="min-width: 80px;max-width: 120px;" v-model="row.assert_type" placeholder="选择类型" @change="emitChange">
                  <el-option
                    v-for="op in assertType"
                    :key="op.label"
                    :label="op.label"
                    :value="op.value"
                  />
                </el-select>

                <template v-if="row.assert_type === 'text'">
                  <el-select v-model="row.selector" placeholder="选择或输入元素选择器(xpath=//*[@id='name'])" filterable allow-create  @change="emitChange">
                    <el-option
                      v-for="op in pageOptions"
                      :key="op.label"
                      :label="op.label"
                      :value="op.value"
                    />
                  </el-select>
                  <el-input
                    v-model="row.expect"
                    placeholder="期望文本"
                    style="width:100%"
                    @input="emitChange"
                  />
                </template>
                <template v-if="row.assert_type === 'url'">
                  <el-input
                    v-model="row.expect"
                    placeholder="期望文本"
                    style="width:100%"
                    @input="emitChange"
                  />
                </template>
                <template v-if="row.assert_type === 'title'">
                  <el-input
                    v-model="row.expect"
                    placeholder="期望文本"
                    style="width:100%"
                    @input="emitChange"
                  />
                </template>
                <template v-if="row.assert_type === 'visible'">
                  <el-select v-model="row.selector" placeholder="选择或输入元素选择器(xpath=//*[@id='name'])" filterable allow-create  @change="emitChange">
                    <el-option
                      v-for="op in pageOptions"
                      :key="op.label"
                      :label="op.label"
                      :value="op.value"
                    />
                  </el-select>
                </template>
                <template v-if="row.assert_type === 'exists'">
                  <el-select v-model="row.selector" placeholder="选择或输入元素选择器(xpath=//*[@id='name'])" filterable allow-create  @change="emitChange">
                    <el-option
                      v-for="op in pageOptions"
                      :key="op.label"
                      :label="op.label"
                      :value="op.value"
                    />
                  </el-select>
                </template>
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
              <!-- 输入 -->
        <template v-if="row.action === 'input'">
          <el-select v-model="row.selector" placeholder="选择或输入元素选择器" filterable allow-create  @change="emitChange">
            <el-option
              v-for="op in pageOptions"
              :key="op.label"
              :label="op.label"
              :value="op.value"
            />
          </el-select>
          <el-input
            v-model="row.value"
            placeholder="输入值"
            style="width:100%"
            @input="emitChange"
          />
        </template>

        <!-- 等待时间 -->
        <el-input
          v-if="row.action === 'sleep'"
          v-model="row.seconds"
          placeholder="等待时间(秒)"
          style="width:100%"
          @input="emitChange"
        />

        <!-- 执行JS -->
        <el-input
          v-if="row.action === 'execute_script'"
          v-model="row.script"
          placeholder="JS代码"
          style="width:100%"
          @input="emitChange"
        />

        <!-- 上传文件 -->
        <template v-if="row.action === 'upload'">
          <el-select v-model="row.selector" placeholder="选择或输入元素选择器" filterable allow-create  @change="emitChange">
            <el-option
              v-for="op in pageOptions"
              :key="op.label"
              :label="op.label"
              :value="op.value"
            />
          </el-select>
          <el-select v-model="row.filePath" placeholder="选择文件路径" filterable @change="emitChange">
            <el-option
              v-for="file in fileOptions"
              :key="file.value"
              :label="file.label"
              :value="file.value"
            />
          </el-select>
          <!-- <el-input
            v-model="row.filePath"
            placeholder="文件路径"
            style="width:100%"
            @input="emitChange"
          /> -->
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
        <el-card shadow="never" style="width: 100%" >
          <div
            v-for="(step, i) in localCaseData.post_steps"
            :key="i"
            style="margin-bottom:12px;display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px dashed #eee"
          >
            <el-select v-model="step.type" style="width: 190px" @change="emitChange">
              <el-option label="SQL" value="sql" />
              <!-- <el-option label="接口" value="api" />
              <el-option label="Shell" value="shell" /> -->
            </el-select>
            <!-- SQL类型 -->
            <template v-if="step.type === 'sql'">
              <!-- <el-input v-model="step.dbEnv" placeholder="数据库环境/别名" style="width:120px" @input="emitChange" /> -->

              <el-select v-model="step.dbEnv" style="width: 300px;" placeholder="数据库环境/别名" @change="emitChange">
                <el-option
                  v-for="env in projectStore.current?.envs"
                  :key="env.id"
                  :label="env.name"
                  :value="env.id"
                />
              </el-select>

              <el-input type="textarea" v-model="step.sql" placeholder="SQL语句" style="width: 100%;" @input="emitChange" />
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
        <el-button @click="jsonEditor.visible=false">取消</el-button>
        <el-button type="primary" @click="confirmJsonEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick, computed, reactive, onMounted } from 'vue'
import Draggable from 'vuedraggable'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUiTestStore, simpleElementType } from '@/stores/uiTestStore'
import { useProjectStore } from '@/stores/project'

const projectStore = useProjectStore()
const store = useUiTestStore()

type ExtractVar = { varName: string, jsonpath: string }

type PreApiStep = {
  name: string
  request: {url: string, method: string, body?: string}
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
  action: string;
  url?: string;
  selector?: string;
  header?: string;
  expect?: string;
  assert_type?: string
  value?: string;
  seconds?: number;
  script?: string;
  filePath?: string;
  __uuid?: string;
};
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
  // { label: '设置Header', value: 'set_header' },
  { label: '跳转页面', value: 'goto' },
  { label: '点击', value: 'click' },
  { label: '等待时间', value: 'sleep' },
  { label: '输入', value: 'input' },
  { label: '执行js', value: 'execute_script' },
  { label: '上传文件', value: 'upload' },
  { label: '断言', value: 'assert' },
]

const assertType = [
{ label: '元素文本', value: 'text' },
{ label: '元素可见', value: 'visible' },
{ label: '元素存在', value: 'exists' },
{ label: 'URL包含', value: 'url' },
{ label: '页面标题', value: 'title' },
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
  emit('update:caseData', JSON.parse(JSON.stringify(localCaseData.value)));
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
    name: 'token',
    request: {url: '', method: 'POST', body: ''},
    // url: '',
    // method: 'POST',
    // body: '',
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
  localCaseData.value.pre_apis[preIdx].extracts.push({ varName: '', jsonpath: '' })
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
  jsonEditor.value.value = localCaseData.value.pre_apis[idx].request.body || ''
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
  localCaseData.value.pre_apis[jsonEditor.value.preIdx].request.body = jsonEditor.value.value
  jsonEditor.value.visible = false
  emitChange()
}

// ======= 校验函数 =======
const validateForm = async () => {
  // 基本项校验
  const v = await caseForm.value?.validate();
  if (!v) return false;

  if (!localCaseData.value.name) {
    ElMessage.error('请输入用例名');
    return false;
  }

  // 前置接口校验
  for (const [i, api] of localCaseData.value.pre_apis.entries()) {
    if (!api.request.url) {
      ElMessage.error(`第${i + 1}个前置接口URL不能为空`);
      return false;
    }
    if (!api.request.method) {
      ElMessage.error(`第${i + 1}个前置接口请求方法不能为空`);
      return false;
    }
    for (const [k, ext] of (api.extracts || []).entries()) {
      if (!ext.varName) {
        ElMessage.error(`第${i + 1}个前置接口的第${k + 1}个变量名不能为空`);
        return false;
      }
      if (!ext.jsonpath || !ext.jsonpath.startsWith('$')) {
        ElMessage.error(`第${i + 1}个前置接口的第${k + 1}个JsonPath不合法`);
        return false;
      }
    }
    // JSON格式校验
    if (api.request.method === 'POST' && api.request.body) {
      try {
        JSON.parse(api.request.body);
      } catch (e) {
        ElMessage.error(`第${i + 1}个前置接口Body不是合法JSON`);
        return false;
      }
    }
  }

  // 主流程步骤校验
  for (const [i, step] of localCaseData.value.steps.entries()) {
    if (!step.action) {
      ElMessage.error(`第${i + 1}个主流程步骤的动作不能为空`);
      return false;
    }

    switch (step.action) {
      case 'goto':
        if (!step.url) {
          ElMessage.error(`第${i + 1}个主流程步骤的URL不能为空`);
          return false;
        }
        break;

      case 'click':
        if (!step.selector) {
          ElMessage.error(`第${i + 1}个主流程步骤的选择器不能为空`);
          return false;
        }
        break;

      case 'input':
        if (!step.selector) {
          ElMessage.error(`第${i + 1}个主流程步骤的选择器不能为空`);
          return false;
        }
        if (!step.value) {
          ElMessage.error(`第${i + 1}个主流程步骤的输入值不能为空`);
          return false;
        }
        break;

      case 'sleep':
        if (!step.seconds || step.seconds <= 0) {
          ElMessage.error(`第${i + 1}个主流程步骤的等待时间必须大于0`);
          return false;
        }
        break;

      case 'execute_script':
        if (!step.script) {
          ElMessage.error(`第${i + 1}个主流程步骤的JS代码不能为空`);
          return false;
        }
        break;

      case 'upload':
        if (!step.selector) {
          ElMessage.error(`第${i + 1}个主流程步骤的选择器不能为空`);
          return false;
        }
        if (!step.filePath) {
          ElMessage.error(`第${i + 1}个主流程步骤的文件路径不能为空`);
          return false;
        }
        break;

      case 'assert':
        // console.error('assert === ', step)
        if (!step.assert_type) {
          ElMessage.error(`第${i + 1}个主流程步骤的断言类型不能为空`);
          return false;
        }

        // if (step.selector) {
        //   if (step.selector === '') {
        //     ElMessage.error(`第${i + 1}个主流程步骤的选择器不能为空`);
        //     return false;
        //   }
          
        // }
        // if (step.expect === '') {
        //   console.error('assert expect === ', step.expect)

        //   ElMessage.error(`第${i + 1}个主流程步骤的期望文本不能为空`);
        //   return false;

          
        // }
        break;

      default:
        ElMessage.error(`第${i + 1}个主流程步骤的动作不合法`);
        return false;
    }
  }

  // 后置处理步骤校验
  for (const [i, step] of localCaseData.value.post_steps.entries()) {
    if (!step.type) {
      ElMessage.error(`第${i + 1}个后置处理步骤的类型不能为空`);
      return false;
    }

    switch (step.type) {
      case 'sql':
        if (!step.sql) {
          ElMessage.error(`第${i + 1}个后置处理步骤的SQL语句不能为空`);
          return false;
        }
        break;

      case 'api':
        if (!step.apiUrl) {
          ElMessage.error(`第${i + 1}个后置处理步骤的接口URL不能为空`);
          return false;
        }
        if (!step.apiMethod) {
          ElMessage.error(`第${i + 1}个后置处理步骤的请求方法不能为空`);
          return false;
        }
        if (step.apiBody) {
          try {
            JSON.parse(step.apiBody);
          } catch (e) {
            ElMessage.error(`第${i + 1}个后置处理步骤的请求体不是合法JSON`);
            return false;
          }
        }
        break;

      case 'shell':
        if (!step.shellCmd) {
          ElMessage.error(`第${i + 1}个后置处理步骤的Shell命令不能为空`);
          return false;
        }
        break;

      default:
        ElMessage.error(`第${i + 1}个后置处理步骤的类型不合法`);
        return false;
    }
  }

  return true;
};



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


const fileOptions = ref<{ label: string; value: string }[]>([]);

async function fetchFileOptions() {
  try {
    // 假设 store.testFileList 是一个数组，包含文件信息
    const testFileList = await store.fetchTestFileList();
    console.log
    if (!testFileList || !testFileList.length) {
      ElMessage.warning('未获取到文件列表数据');
      return;
    }

    // 将文件列表映射到 fileOptions
    fileOptions.value = testFileList.map((file: { name: string; file_name: string }) => ({
      label: file.file_name, // 文件名称
      value: file.file_name, // 文件路径
    }));
  } catch (error) {
    console.error('获取文件列表失败:', error);
    ElMessage.error('获取文件列表失败，请稍后重试');
  }
}


// 关于元素选择
const pageOptions = ref<{ label: string; value: string }[]>([]);

async function fetchPageOptions() {
  try {
    // 调用接口获取数据
    const response = await store.fetchSimpleUiElementList();
    if (!response || !response.length) {
      ElMessage.warning('未获取到页面选项数据');
      return;
    }

    // 将接口返回的数据映射到 pageOptions
    pageOptions.value = response.map((item: simpleElementType) => ({
      label: item.name, // 显示名称
      value: item.locator_type + "=" + item.locator_value, // 元素定位值
    }));
  } catch (error) {
    console.error('获取页面选项失败:', error);
    ElMessage.error('获取页面选项失败，请稍后重试');
  }
}

onMounted(async () => {
  fetchPageOptions(); // 页面加载时调用
  await fetchFileOptions()
});





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
/* width: 700px; */
}




</style>
