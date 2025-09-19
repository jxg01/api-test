<template>
  <div style="padding:24px 0 0 0">
    <el-form :model="localCaseData" label-width="80px" ref="caseForm" :rules="formRules" :disabled="!isEditing">
      <el-form-item label="用例名" prop="name">
        <el-input v-model="localCaseData.name" @input="emitChange" :disabled="!isEditing"/>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="localCaseData.description" @input="emitChange" type="textarea" :rows="3" :disabled="!isEditing"/>
      </el-form-item>
      <el-form-item label="前置登录">
        <el-select v-model="localCaseData.login_case" placeholder="选择前置登录用例" clearable filterable @change="emitChange" :disabled="!isEditing">
          <el-option
            v-for="caseItem in loginCaseOptions"
            :key="caseItem.id"
            :label="caseItem.name"
            :value="caseItem.id"
          />
        </el-select>
        <div style="font-size: 12px; color: #606266; margin-top: 4px;"># 可选，将在当前用例执行前运行选中的登录用例</div>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="localCaseData.enable" @change="emitChange" :disabled="!isEditing">
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
            <!-- API类型前置条件 -->
            <template v-if="!step.type || step.type === 'api'">
              <div style="display:flex;align-items:center;gap:8px;">
                <el-select v-model="step.name" placeholder="前置接口类型" style="width:120px;" @change="emitChange" :disabled="!isEditing">
                  <el-option label="API" value="api" />
                </el-select>
                <template v-if="step.request">
                  <el-input v-model="step.request.url" placeholder="接口URL" style="width:210px;" @input="emitChange" :status="!step.request.url ? 'error':undefined" :disabled="!isEditing"/>
                  <el-select v-model="step.request.method" placeholder="方法" style="width:90px" @change="emitChange" :disabled="!isEditing">
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
                    :disabled="!isEditing"
                  />
                  <el-button
                    v-if="step.request.method === 'POST' && isEditing"
                    size="small"
                    @click="openJsonEditor(i)"
                    style="padding:0 6px"
                  >JSON可视化</el-button>
                </template>
                <el-button type="danger" size="small" @click="removePreApiStep(i)" v-if="isEditing"><el-icon><Delete /></el-icon></el-button>
              </div>
              <!-- 多变量提取区 -->
              <div style="margin-left:12px;">
                <el-row v-for="(extract, k) in step.extracts" :key="k" style="margin-bottom:4px;align-items:center;">
                  <el-icon color="pink" :size="24"><SetUp /></el-icon>
                  <el-col :span="6">
                    <el-input v-model="extract.varName" placeholder="变量名" @input="emitChange" :status="!extract.varName ? 'error':undefined" :disabled="!isEditing"/>
                  </el-col>
                  <el-col :span="14" style="margin-left:10px;">
                    <el-input v-model="extract.jsonpath" placeholder="JsonPath如$.access_token" @input="emitChange" :status="!extract.jsonpath || !extract.jsonpath.startsWith('$') ? 'error':undefined" :disabled="!isEditing"/>
                  </el-col>
                  <el-col :span="1" style="margin-left:6px;">
                    <el-button type="danger" size="small" @click="removeExtract(i, k)" v-if="isEditing"><el-icon><Delete /></el-icon></el-button>
                  </el-col>
                </el-row>
                <el-button type="success" size="small" @click="addExtract(i)" v-if="isEditing">添加提取变量</el-button>
              </div>
            </template>
            
            <!-- SQL类型前置条件 -->
            <template v-else-if="step.type === 'sql'">
              <div style="display:flex;align-items:center;gap:8px;">
                <!-- <el-input v-model="step.name" placeholder="步骤名称" style="width:120px;" @input="emitChange" :disabled="!isEditing" /> -->
                <el-input v-model="step.name" placeholder="步骤名称" style="width:120px;" @input="emitChange" :disabled="true" />
                <el-select v-model="step.dbEnv" style="width: 300px;" placeholder="数据库环境" @change="emitChange" :disabled="!isEditing">
                  <el-option
                    v-for="env in projectStore.current?.envs"
                    :key="env.id"
                    :label="env.name"
                    :value="env.id"
                  />
                </el-select>
                <el-button type="danger" size="small" @click="removePreApiStep(i)" v-if="isEditing"><el-icon><Delete /></el-icon></el-button>
              </div>
              
              <!-- SQL语句 -->
              <div class="sql-section">
                <el-input type="textarea" v-model="step.sql" placeholder="SQL语句" style="width: 100%;" @input="emitChange" :disabled="!isEditing" />
              </div>
            </template>
          </div>
          <div v-if="isEditing">
            <el-button type="primary" size="small" @click="addPreApiStep('api')">添加接口</el-button>
            <el-button type="primary" size="small" @click="addPreApiStep('sql')">添加SQL</el-button>
          </div>
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
              <span v-if="isEditing" class="drag-handle" style="cursor:move;font-size:30px;user-select:none;color:darkorchid;">⠿</span>
              <el-select v-model="row.action" style="min-width: 80px;max-width: 120px;" @change="emitChange" :disabled="!isEditing">
                <el-option v-for="a in stepActions" :key="a.value" :label="a.label" :value="a.value" />
              </el-select>
              <el-input
                v-if="row.action === 'goto'"
                v-model="row.url"
                placeholder="URL"
                style="width:100%"
                @input="emitChange"
                :disabled="!isEditing"
              />
              <template v-if="row.action === 'assert'">
                <el-select style="min-width: 80px;max-width: 120px;" v-model="row.assert_type" placeholder="选择类型" @change="emitChange" :disabled="!isEditing">
                  <el-option
                    v-for="op in assertType"
                    :key="op.label"
                    :label="op.label"
                    :value="op.value"
                  />
                </el-select>

                <template v-if="row.assert_type === 'text'">
                  <el-select v-model="row.element_id" placeholder="选择或输入元素ID" filterable allow-create  @change="emitChange" :disabled="!isEditing">
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
                    :disabled="!isEditing"
                  />
                </template>
                <template v-if="row.assert_type === 'url'">
                  <el-input
                    v-model="row.expect"
                    placeholder="期望文本"
                    style="width:100%"
                    @input="emitChange"
                    :disabled="!isEditing"
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
                  <el-select v-model="row.element_id" placeholder="选择或输入元素ID" filterable allow-create  @change="emitChange" :disabled="!isEditing">
                    <el-option
                      v-for="op in pageOptions"
                      :key="op.label"
                      :label="op.label"
                      :value="op.value"
                    />
                  </el-select>
                </template>
                <template v-if="row.assert_type === 'exists'">
                  <el-select v-model="row.element_id" placeholder="选择或输入元素ID" filterable allow-create  @change="emitChange">
                    <el-option
                      v-for="op in pageOptions"
                      :key="op.label"
                      :label="op.label"
                      :value="op.value"
                    />
                  </el-select>
                </template>
              </template>

              <!-- SQL执行 -->
              <template v-if="row.action === 'sql'">
                <el-select v-model="row.dbEnv" placeholder="数据库环境" @change="emitChange" style="min-width: 150px; max-width: 300px;">
                  <el-option
                    v-for="env in projectStore.current?.envs || []"
                    :key="env.id"
                    :label="env.name"
                    :value="env.id"
                  />
                </el-select>
                <el-input
                  v-model="row.sql"
                  placeholder="SQL语句"
                  style="width: 100%"
                  type="textarea"
                  :rows="3"
                  @input="emitChange"
                />

              </template>

              <template v-if="row.action === 'click'">
                <el-select v-model="row.element_id" placeholder="选择或输入元素ID" filterable allow-create  @change="emitChange">
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
          <el-select v-model="row.element_id" placeholder="选择或输入元素ID" filterable allow-create  @change="emitChange">
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
                :disabled="!isEditing"
              />

        <!-- 执行JS -->
        <el-input
                v-if="row.action === 'execute_script'"
                v-model="row.script"
                placeholder="JS代码"
                style="width:100%"
                @input="emitChange"
                :disabled="!isEditing"
              />

        <!-- 等待元素 -->
        <template v-if="row.action === 'wait_element'">
          <el-select v-model="row.element_id" placeholder="选择或输入元素ID" filterable allow-create @change="emitChange" :disabled="!isEditing">
            <el-option
              v-for="op in pageOptions"
              :key="op.label"
              :label="op.label"
              :value="op.value"
            />
          </el-select>
          <el-input
            v-model="row.wait_time"
            placeholder="等待时间(秒)"
            style="width: 100%"
            @input="emitChange"
            :disabled="!isEditing"
          />
        </template>

        <!-- 上传文件 -->
        <template v-if="row.action === 'upload'">
          <el-select v-model="row.element_id" placeholder="选择或输入元素ID" filterable allow-create  @change="emitChange" :disabled="!isEditing">
                    <el-option
                      v-for="op in pageOptions"
                      :key="op.label"
                      :label="op.label"
                      :value="op.value"
                    />
                  </el-select>
                  <el-select v-model="row.filePath" placeholder="选择文件路径" filterable @change="emitChange" :disabled="!isEditing">
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
              <el-button type="danger" size="small" @click="removeStep($index)" v-if="isEditing"><el-icon><Delete /></el-icon></el-button>
            </div>
          </template>
        </draggable>
        
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" style="" @click="addStep" v-if="isEditing">添加步骤</el-button>
      </el-form-item>
      <!-- 后置处理步骤区 -->
      <el-form-item label="后置处理">
        <el-card shadow="never" style="width: 100%">
          <div
            v-for="(step, i) in localCaseData.post_steps"
            :key="i"
            style="margin-bottom:12px;display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px dashed #eee"
          >
            <el-select v-model="step.type" style="width: 190px" @change="emitChange" :disabled="!isEditing">
              <el-option label="SQL" value="sql" />
              <!-- <el-option label="接口" value="api" /> -->
              <!-- <el-option label="Shell" value="shell" /> -->
            </el-select>
            <!-- SQL类型 -->
            <template v-if="step.type === 'sql'">
              <!-- <el-input v-model="step.dbEnv" placeholder="数据库环境/别名" style="width:120px" @input="emitChange" /> -->
              <el-select v-model="step.dbEnv" style="width: 300px;" placeholder="数据库环境/别名" @change="emitChange" :disabled="!isEditing">
                <el-option
                  v-for="env in projectStore.current?.envs"
                  :key="env.id"
                  :label="env.name"
                  :value="env.id"
                />
              </el-select>
              <el-input type="textarea" v-model="step.sql" placeholder="SQL语句" style="width: 100%;" @input="emitChange" :disabled="!isEditing" />
            </template>
            <!-- API类型 -->
            <template v-if="step.type === 'api'">
              <el-input v-model="step.apiUrl" placeholder="接口URL" style="width:180px" @input="emitChange" :disabled="!isEditing" />
              <el-select v-model="step.apiMethod" placeholder="方法" style="width:70px" @change="emitChange" :disabled="!isEditing">
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
                :disabled="!isEditing"
              />
            </template>
            <!-- Shell类型 -->
            <template v-if="step.type === 'shell'">
              <el-input v-model="step.shellCmd" placeholder="Shell命令" style="width:220px" @input="emitChange" :disabled="!isEditing" />
            </template>
            <el-button type="danger" size="small" @click="removePostStep(i)" v-if="isEditing"><el-icon><Delete /></el-icon></el-button>
          </div>
          <el-button type="primary" size="small" @click="addPostStep" v-if="isEditing">添加后置步骤</el-button>
        </el-card>
      </el-form-item>
    </el-form>
    <div style="margin:18px 0">
      <!-- 查看模式 -->
      <template v-if="!isEditing">
        <el-button type="primary" @click="enterEditMode">编辑</el-button>
        <el-button type="success" @click="onRun">调试运行</el-button>
      </template>
      <!-- 编辑模式 -->
      <template v-else>
        <el-button type="primary" @click="onSave">保存</el-button>
        <el-button @click="cancelEdit">取消</el-button>
      </template>
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

// SQL变量提取类型
type SQLExtractVar = {
  varName: string,
  column: string
}

// 前置条件步骤类型
type PreApiStep = {
  name: string
  type?: 'api' | 'sql' // 新增SQL类型
  request?: {url: string, method: string, body?: string}
  extracts?: ExtractVar[] // API变量提取
  // SQL相关字段
  sql?: string
  dbEnv?: string
  sqlExtracts?: SQLExtractVar[]
}
type PostStep = {
  type: 'sql' | 'api' | 'shell',
  sql?: string,
  dbEnv?: string,
  apiUrl?: string,
  apiMethod?: string,
  apiBody?: string
  shellCmd?: string
  sqlExtracts?: SQLExtractVar[] // SQL变量提取
}
type Step = {
  action: string;
  url?: string;
  element_id?: string;
  header?: string;
  expect?: string;
  assert_type?: string
  value?: string;
  seconds?: number;
  wait_time?: number;
  script?: string;
  filePath?: string;
  __uuid?: string;
  // SQL相关字段
  sql?: string;
  dbEnv?: string;
  sqlExtracts?: SQLExtractVar[];
};
type CaseData = {
  id: string,
  name: string,
  description: string,
  pre_apis: PreApiStep[],
  steps: Step[]
  post_steps: PostStep[]
  enable: boolean
  login_case?: string | null
}

const props = defineProps<{
  caseData: CaseData
  defaultEditMode?: boolean
}>()
const emit = defineEmits(['update:caseData', 'save', 'run', 'cancel'])
const caseForm = ref<FormInstance>()
const isEditing = ref(props.defaultEditMode || false)
const originalData = ref<CaseData>(JSON.parse(JSON.stringify(props.caseData)))
const formRules = reactive<FormRules>({
  name: [
    {
      required: true,
      message: '请输入用例名',
      trigger: 'blur'
    }
  ]
})

// 进入编辑模式
const enterEditMode = () => {
  isEditing.value = true;
  // 编辑模式不需要重新设置originalData，因为它应该已经在组件初始化和props变化时被正确设置
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
  // 恢复原始数据
  localCaseData.value = JSON.parse(JSON.stringify(originalData.value));
  emit('cancel');
};



// 获取当前用例数据
const getCaseData = () => {
  return JSON.parse(JSON.stringify(localCaseData.value));
};

// 设置编辑状态（供父组件调用）
const setEditing = (editing: boolean) => {
  isEditing.value = editing;
};

const stepActions = [
  // { label: '设置Header', value: 'set_header' },
  { label: '跳转页面', value: 'goto' },
  { label: '点击', value: 'click' },
  { label: '等待时间', value: 'sleep' },
  { label: '等待元素', value: 'wait_element' },
  { label: '输入', value: 'input' },
  { label: '执行js', value: 'execute_script' },
  { label: '上传文件', value: 'upload' },
  { label: '断言', value: 'assert' },
  { label: '执行SQL', value: 'sql' },
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
const localCaseData = ref<CaseData>(JSON.parse(JSON.stringify(props.caseData || { id: '', name: '', description: '', pre_apis: [], steps: [], login_case: null })))
if (localCaseData.value.steps) fillUuid(localCaseData.value.steps)
if (!localCaseData.value.pre_apis) localCaseData.value.pre_apis = []
if (!localCaseData.value.post_steps) localCaseData.value.post_steps = []
localCaseData.value.pre_apis.forEach(p => { if (!p.extracts) p.extracts = [] })

// 监听props.caseData变化，只在非编辑模式下更新localCaseData和originalData
watch(
  () => props.caseData,
  (val) => {
    // 只在非编辑模式下更新数据，避免覆盖用户正在编辑的内容
    if (!isEditing.value && val) {
      // 深拷贝确保数据隔离
      localCaseData.value = JSON.parse(JSON.stringify(val))
      // 确保steps有UUID
      if (localCaseData.value.steps) fillUuid(localCaseData.value.steps)
      // 确保必要字段存在
      if (!localCaseData.value.pre_apis) localCaseData.value.pre_apis = []
      if (!localCaseData.value.post_steps) localCaseData.value.post_steps = []
      localCaseData.value.pre_apis.forEach(p => { if (!p.extracts) p.extracts = [] })
      // 确保originalData也同步更新
      originalData.value = JSON.parse(JSON.stringify(localCaseData.value))
    }
  },
  { deep: true, immediate: true }
)

// 监听store中的moduleList变化，确保用例详情与tree数据实时同步
watch(
  () => store.moduleList,
  (newModuleList) => {
    if (!isEditing.value && props.caseData.id) {
      // 从最新的moduleList中查找当前用例的数据
      const findCaseInModules = (modules: any[]): CaseData | null => {
        for (const module of modules) {
          if (module.type === 'case' && module.id === props.caseData.id) {
            return module.caseData;
          }
          if (module.children) {
            const found: CaseData | null = findCaseInModules(module.children);
            if (found) return found;
          }
        }
        return null;
      };
      
      const updatedCaseData: CaseData | null = findCaseInModules(newModuleList);
      if (updatedCaseData && JSON.stringify(updatedCaseData) !== JSON.stringify(props.caseData)) {
        // 如果发现数据不一致，更新localCaseData和originalData
        localCaseData.value = JSON.parse(JSON.stringify(updatedCaseData));
        originalData.value = JSON.parse(JSON.stringify(updatedCaseData));
      }
    }
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
function addPreApiStep(type: 'api' | 'sql' = 'api') {
  if (type === 'api') {
    localCaseData.value.pre_apis.push({
      name: 'api',
      type: 'api',
      request: {url: '', method: 'POST', body: ''},
      extracts: []
    })
  } else {
    localCaseData.value.pre_apis.push({
      name: 'sql',
      type: 'sql',
      sql: '',
      dbEnv: '',
      sqlExtracts: [{ varName: '', column: '' }]
    })
  }
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
  if (!localCaseData.value.pre_apis[preIdx].extracts) {
    localCaseData.value.pre_apis[preIdx].extracts = []
  }
  localCaseData.value.pre_apis[preIdx].extracts.push({ varName: '', jsonpath: '' })
  emitChange()
}
function removeExtract(preIdx: number, idx: number) {
  if (localCaseData.value.pre_apis[preIdx].extracts) {
    localCaseData.value.pre_apis[preIdx].extracts.splice(idx, 1)
  }
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
  jsonEditor.value.value = localCaseData.value.pre_apis[idx].request?.body || ''
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
  const preApi = localCaseData.value.pre_apis[jsonEditor.value.preIdx]
  if (!preApi.request) {
    preApi.request = { url: '', method: 'GET' }
  }
  if (preApi.request) {
    preApi.request.body = jsonEditor.value.value
  }
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

  // 前置步骤校验
  for (const [i, step] of localCaseData.value.pre_apis.entries()) {
    // 只对API类型的前置步骤进行URL和method验证
    if (step.type === 'api') {
      if (!step.request) {
        step.request = { url: '', method: 'GET' }
      }
      if (step.request && !step.request.url) {
        ElMessage.error(`第${i + 1}个前置接口URL不能为空`);
        return false;
      }
      if (step.request && !step.request.method) {
        ElMessage.error(`第${i + 1}个前置接口请求方法不能为空`);
        return false;
      }
    }
    // 对SQL类型的前置步骤进行必填校验
    if (step.type === 'sql') {
      if (!step.dbEnv) {
        ElMessage.error(`第${i + 1}个前置SQL的数据库环境不能为空`);
        return false;
      }
      if (!step.sql || step.sql.trim() === '') {
        ElMessage.error(`第${i + 1}个前置SQL的SQL语句不能为空`);
        return false;
      }
    }
    for (const [k, ext] of (step.extracts || []).entries()) {
      if (!ext.varName) {
        ElMessage.error(`第${i + 1}个前置接口的第${k + 1}个变量名不能为空`);
        return false;
      }
      if (!ext.jsonpath || !ext.jsonpath.startsWith('$')) {
        ElMessage.error(`第${i + 1}个前置接口的第${k + 1}个JsonPath不合法`);
        return false;
      }
    }
    // 只对API类型的前置步骤进行JSON格式校验
    if (step.type === 'api' && step.request && step.request.method === 'POST' && step.request.body) {
      try {
        if (step.request.body.trim() !== '') {
          JSON.parse(step.request.body);
        }
      } catch (e) {
        ElMessage.error(`第${i + 1}个前置接口的请求体JSON格式不合法`);
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
      case 'input':
        if (!step.element_id) {
          ElMessage.error(`第${i + 1}个主流程步骤的元素ID不能为空`);
          return false;
        }
        break;

      case 'sleep':
        if (!step.seconds || isNaN(Number(step.seconds))) {
          ElMessage.error(`第${i + 1}个主流程步骤的等待时间必须为数字`);
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
        if (!step.element_id) {
          ElMessage.error(`第${i + 1}个主流程步骤的元素ID不能为空`);
          return false;
        }
        if (!step.filePath) {
          ElMessage.error(`第${i + 1}个主流程步骤的文件路径不能为空`);
          return false;
        }
        break;

      case 'assert':
        if (!step.assert_type) {
          ElMessage.error(`第${i + 1}个主流程步骤的断言类型不能为空`);
          return false;
        }
        break;

      case 'sql':
        if (!step.dbEnv) {
          ElMessage.error(`第${i + 1}个主流程步骤的数据库环境不能为空`);
          return false;
        }
        if (!step.sql) {
          ElMessage.error(`第${i + 1}个主流程步骤的SQL语句不能为空`);
          return false;
        }
        break;

      case 'wait_element':
        if (!step.element_id) {
          ElMessage.error(`第${i + 1}个主流程步骤的元素ID不能为空`);
          return false;
        }
        if (!step.wait_time || isNaN(Number(step.wait_time))) {
          ElMessage.error(`第${i + 1}个主流程步骤的等待时间必须为数字`);
          return false;
        }
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
        if (!step.dbEnv) {
          ElMessage.error(`第${i + 1}个后置处理步骤的数据库环境不能为空`);
          return false;
        }
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
        // JSON格式校验
        if (step.apiMethod === 'POST' && step.apiBody) {
          try {
            if (step.apiBody.trim() !== '') {
              JSON.parse(step.apiBody);
            }
          } catch (e) {
            ElMessage.error(`第${i + 1}个后置处理步骤的请求体JSON格式不合法`);
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
    setEditing(false); // 保存成功后切换回非编辑模式
    // 保存成功后刷新tree数据，确保显示最新的用例数据
    // await store.fetchModuleList();
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
const loginCaseOptions = ref<{ id: string; name: string }[]>([]);

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
      label: file.file_name || '', // 文件名称
      value: file.file_name || '', // 文件路径
    }));
  } catch (error) {
    console.error('获取文件列表失败:', error);
    ElMessage.error('获取文件列表失败，请稍后重试');
  }
}


// 关于元素选择
const pageOptions = ref<{id: number, label: string; value: string }[]>([]);

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
      // value: item.locator_type + "=" + item.locator_value, // 元素定位值
      value: item.id, // 元素ID
    }));
  } catch (error) {
    console.error('获取页面选项失败:', error);
    ElMessage.error('获取页面选项失败，请稍后重试');
  }
}

// 从模块列表中提取所有用例并过滤当前用例
function fetchLoginCaseOptions() {
  try {
    // 确保moduleList已加载
    if (!store.moduleList || !store.moduleList.length) {
      ElMessage.warning('模块列表为空，无法获取登录用例选项');
      return;
    }

    // 从模块列表中提取所有用例并过滤当前用例
    const allCases: { id: string; name: string }[] = [];
    
    // 递归遍历模块列表，提取所有用例
    function extractCasesFromModules(modules: any[]) {

      modules.forEach(module => {
        // 添加当前模块下的用例
        if (module.children && module.children.length) {
          module.children.forEach((testCase: any) => {
            // 排除当前用例 - 修复类型不匹配问题
            if (String(testCase.id) !== String(localCaseData.value.id) && testCase.label !== '新建用例') {
              allCases.push({
                id: testCase.id,
                name: testCase.label
              });
            }
          });
        }
      });
    }
    extractCasesFromModules(store.moduleList);
    
    // 排序用例（可选）
    allCases.sort((a, b) => a.name.localeCompare(b.name));
    
    // 更新loginCaseOptions
    loginCaseOptions.value = allCases;
  } catch (error) {
    console.error('获取登录用例选项失败:', error);
    ElMessage.error('获取登录用例选项失败，请稍后重试');
  }
}

onMounted(async () => {
  fetchPageOptions(); // 页面加载时调用
  await fetchFileOptions();
  
  // 如果模块列表已加载，直接初始化登录用例选项
  if (store.moduleList && store.moduleList.length) {
    fetchLoginCaseOptions();
  }
});

// 监听项目ID变化，重新加载模块和登录用例选项
watch(
  () => projectStore.currentProjectId,
  async (newProjectId, oldProjectId) => {
    if (newProjectId !== oldProjectId && newProjectId) {
      try {
        // 等待模块列表重新加载
        await store.fetchModuleList();
        // 重新加载登录用例选项
        fetchLoginCaseOptions();
      } catch (error) {
        console.error('切换项目后重新加载模块列表失败:', error);
      }
    }
  }
);

// 导出方法供父组件使用
defineExpose({
  validateForm,
  getCaseData,
  setEditing
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
