<template>
  <div class="case-management">
    <!-- 顶部标签页导航 -->
    <el-tabs 
      v-model="activeTab" 
      type="card" 
      @tab-remove="removeTab"
      class="case-tabs"
      tab-position="botton"
    >
      <!-- 自定义标签栏 -->
      <template #default>
        <div class="custom-tabs-header">
          <div class="tabs-container">
            <!-- 默认标签页 -->
            <div 
              v-for="pane in ([{ name: 'list', label: '用例列表' }, ...editTabs])"
              :key="pane.name"
              class="el-tabs__item"
              :class="{ 'is-active': activeTab === pane.name }"
              @click="activeTab = pane.name"
            >
              <span>{{ pane.label || pane.title }}</span>
              <el-icon 
                v-if="pane.name !== 'list' & activeTab === pane.name" 
                class="el-icon-close"
                @click.stop="removeTab(pane.name)"
              >
                <Close />
              </el-icon>
            </div>
          </div>

          <!-- 操作按钮区 -->
          <div class="action-buttons">
            <el-tooltip content="新增" >
              <el-icon
                class="add-case-button"
                :class="{ 'is-disabled': editTabs.length === 0 }"
                @click="handleAddNew"
              >
                <Plus />
              </el-icon>
            </el-tooltip>
            <!-- 新增一键删除按钮 -->
            <el-tooltip content="关闭全部" >
              <el-icon
                class="close-all-btn"
                :class="{ 'is-disabled': editTabs.length === 0 }"
                @click="editTabs.length > 0 && closeAllTabs()"
                v-if="editTabs.length!==0"
              >
                <Delete />
              </el-icon>
            </el-tooltip>
            
          </div>
        </div>
      </template>
    </el-tabs>
    <!-- 列表视图 -->
    <div v-show="activeTab === 'list'" class="list-view">
      <BaseTable
      :columns="tableColumns"
      :table-data="paginatedCases"
      :loading="loading"
      >
        <template #operation="scope">
          <el-button type="primary" size="small" @click.stop="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click.stop="handleDelete(scope.row)">删除</el-button>
        </template>
      </BaseTable>
      
      <!-- <BasePagination
        :current-page="pagination.page"
        :page-size="pagination.size"
        :total="pagination.total"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
    /> -->
    </div>

    <!-- 动态表单视图 -->
    <div v-for="tab in editTabs" :key="tab.name">
      <div v-show="activeTab === tab.name" class="form-view">
        <el-form 
          :model="tab.formData" 
          :rules="formRules"
          ref="formRefs"
          :key="tab.name"
          label-width="100px"
        >
          <el-form-item label="用例ID" prop="id">
            <el-input v-model="tab.formData.id" disabled />
          </el-form-item>
          <el-form-item label="用例名称" prop="name">
            <el-input v-model="tab.formData.name" />
          </el-form-item>
          <el-form-item label="负责人" prop="owner">
            <el-select v-model="tab.formData.owner" placeholder="请选择负责人">
              <el-option 
                v-for="user in users" 
                :key="user" 
                :label="user" 
                :value="user"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="tab.formData.status">
              <el-radio 
                v-for="(text, val) in statusText" 
                :key="val" 
                :label="Number(val)"
              >{{ text }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="用例描述" prop="description">
            <el-input 
              v-model="tab.formData.description" 
              type="textarea" 
              :rows="3"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="activeTab = 'list'">返回列表</el-button>
            <el-button type="primary" @click="saveCase(tab)">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { Select, Delete, Close, Plus } from '@element-plus/icons-vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable.vue'
import BasePagination from '@/components/BasePagination.vue'

type TestCase = {
  id: number
  name: string
  interface_name: string
  description: string
  body: string
  assertions: string
  variable_extract: string
  enabled: boolean
  updated_at: Date
  updated_by: string
  created_at: string
  created_by: string
}

// 表格配置 =================================================================
const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 60 },
  { prop: 'name', label: '用例名称' },
  { prop: 'interface_name', label: '接口名称' },
  { prop: 'updated_by', label: '更新人' },
  { prop: 'updated_at', label: '更新时间' },
  { prop: 'operation', label: '操作', width: 135, slot: 'operation' }
]

const loading = ref(false)








// Ensure no global variable conflicts
const activeTab = ref('list')
const editTabs = reactive([])
const isApiMode = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const formRefs = ref({})
const cases = reactive([
  { id: 1001, name: '用户登录验证', owner: '张三', status: 1, description: '验证用户通过账号密码登录系统的功能' },
  { id: 1002, name: '订单创建流程', owner: '李四', status: 2, description: '测试用户创建订单的完整流程' },
  { id: 1003, name: '支付接口测试', owner: '王五', status: 0, description: '验证支付接口的各种场景' },
  { id: 1004, name: '商品搜索功能', owner: '赵六', status: 1, description: '测试商品搜索的准确性和性能' },
  { id: 1005, name: '购物车操作', owner: '张三', status: 2, description: '验证购物车添加/删除商品功能' }
])
const users = ['张三', '李四', '王五', '赵六', '钱七']
const statusText = { 0: '未开始', 1: '进行中', 2: '已完成' }
const statusMap = { 0: 'info', 1: 'warning', 2: 'success' }
const formRules = {
  name: [
    { required: true, message: '请输入用例名称', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
  ],
  owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}
const paginatedCases = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return cases.slice(start, start + pageSize.value)
})
const handleAddNew = () => {
  const newCase = { id: '', name: 'NewCase', owner: '', status: 0, description: '' }
  handleEdit(newCase)
}
const handleEdit = (row) => {
  const existingTab = editTabs.find(tab => tab.caseId === row.id)
  if (existingTab) {
    activeTab.value = existingTab.name
    return
  }
  const newTab = {
    name: `edit_${Date.now()}`,
    title: `${row.name.substring(0, 8)}${row.name.length > 8 ? '...' : ''}`,
    caseId: row.id,
    caseName: row.name,
    formData: JSON.parse(JSON.stringify(row))
  }
  editTabs.push(newTab)
  activeTab.value = newTab.name
}
const handleDelete = (id) => {
  const index = cases.findIndex(item => item.id === id)
  if (index !== -1) {
    cases.splice(index, 1)
    const tabIndex = editTabs.findIndex(tab => tab.caseId === id)
    if (tabIndex !== -1) {
      removeTab(editTabs[tabIndex].name)
    }
  }
}
const removeTab = (targetName) => {
  if (targetName === 'list') return
  const index = editTabs.findIndex(tab => tab.name === targetName)
  if (index !== -1) {
    editTabs.splice(index, 1)
  }
  if (activeTab.value === targetName) {
    activeTab.value = 'list'
  }
}
const saveCase = async (tab) => {
  const formRef = formRefs.value[tab.name]
  if (!formRef) return
  try {
    await formRef.validate()
    const existingIndex = cases.findIndex(item => item.id === tab.formData.id)
    if (existingIndex !== -1) {
      cases.splice(existingIndex, 1, { ...tab.formData })
    } else {
      cases.unshift({ ...tab.formData })
    }
    tab.title = `${tab.formData.name.substring(0, 8)}${tab.formData.name.length > 8 ? '...' : ''}`
    tab.caseName = tab.formData.name
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}




// 新增方法
const closeAllTabs = () => {
  ElMessageBox.confirm('确定要关闭所有打开的标签页吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    editTabs.splice(0, editTabs.length)
    activeTab.value = 'list'
    ElMessage.success('已关闭所有标签页')
  }).catch(() => {})
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

/* 自定义标签栏样式 */
.custom-tabs-header {
  display: flex;
  align-items: center;
  background-color: rgb(227, 225, 236);
}

.el-tabs__item:hover {
  background-color: rgb(187, 209, 244);
}

.tabs-container {
  display: flex;
  flex: 1;
  /* 文本不换行 */
  white-space: nowrap;
  /* 超出宽度出现滚动条 */
  overflow-x: auto;
}

.close-all-btn {
  margin: 0 8px;
  color: red;
  cursor: pointer;
}
.add-case-button {
  margin: 0 8px;
  color: rgb(22, 10, 161);
  cursor: pointer;
}

</style>