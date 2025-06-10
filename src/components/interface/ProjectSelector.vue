<template>
    <div class="project-selector">
      <div class="search-add">
        <!-- 项目选择下拉框 -->
        <el-select
          v-model="store.selectedProjectId"
          placeholder="选择项目"
          @change="handleProjectChange"
          size="large"
        >
          <el-option
            v-for="project in store.projects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
        <el-button type="primary" @click="openAddDialog" size="large" :icon="CirclePlusFilled" >添加模块</el-button>
      </div>
  
      <!-- 搜索tree -->
      <el-input
        v-model="store.searchText"
        placeholder="输入模块名称或接口名称搜索"
        clearable
        size="large"
      />

      <base-dialog
        ref="dialogRef"
        :fields="formFields"
        :rules="formRules"
        title="模块"
        @submit="handleSubmit"
        @click.stop
      
      ></base-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useInterfaceStore } from '@/stores/interface'
  import { CirclePlusFilled } from '@element-plus/icons-vue'
  import BaseDialog from '@/components/BaseDialog.vue'
  import { ref, computed, markRaw } from 'vue'
  import { ElMessage } from 'element-plus/es'
  import { projectApi } from '@/api'
const store = useInterfaceStore()
  // 表单配置 =================================================================
  const dialogRef = ref()
  const formFields = ref(
    [
      {
        prop: 'project',
        label: '项目',
        component: markRaw(ElSelect),
        onSelectChange: (val: number) => {
            // store.selectedModuleId = val
            store.fetchAllLevelModules(val)
          },
        attrs: { 
          placeholder: '请选择项目' ,
          options: computed(() => {
            return store.projects.map(project => ({
              label: project.name,
              value: project.id
            }))
          }),
          rules: [{ required: true }],

        }
      },
      { 
        prop: 'parent_module', 
        label: '上级模块',
        component: markRaw(ElSelect),
        onSelectChange: (val: number) => {
            // store.selectedModuleId = val
            // store.fetchAllLevelModules(val)
          },
        attrs: { 
          placeholder: '请选择模块',
          clearable: true,
          options: computed(() => {
            return store.allLevelModules.map(module => ({
              label: module.name,
              value: module.id
            }))
          })
          
        }
      }, 
      { 
        prop: 'name', 
        label: '模块名称',
        component: markRaw(ElInput),
        attrs: { placeholder: '请输入模块名称' } 
      }
    ]
  )

  const formRules = {
    name: [
      { required: true, message: '请输入模块名称', trigger: 'blur' },
      { min: 2, max: 30, message: '长度在2-30个字符', trigger: ['blur', 'change'] }
    ],
    project: [
      { required: true, message: '请选择项目', trigger: 'change' }
    ],
  }

  // 表单提交
  const handleSubmit = async (data: any, mode: 'add', done: (success?: boolean) => void) => {
    try {
      console.log('提交数据 submit ', data)
      await store.addModule({
        name: data.name,
        project: data.project,
        parent_module: data.parent_module
      })
      ElMessage.success('模块添加成功')
      done(true)
    } catch (error) {
      // ElMessage.error(error.message || '操作失败')
      done(false)
    }
  }
  // 添加dialog open
  const openAddDialog = () => dialogRef.value?.open('add', {})

  // 项目切换处理
  const handleProjectChange = async (projectId: number) => {
    // 切换项目时清空当前选中的标签页
    store.tabs.forEach(tab => {
      store.removeTab(tab.id)
    })
    store.activeTabId = null
    // 获取当前项目的模块数据 
    store.fetchModules(projectId)
    // 获取当前项目的所有环境信息
    const res = await projectApi.getProjectEnvList({'project_id': projectId})
    store.envs = res.data || []
  }

  
  </script>
  
  <style scoped>
  .project-selector {
    margin-bottom: 10px;
    border-radius: 10px;
    box-shadow: #ebeef5;
    padding: 2px;
  }
  
  .search-add {
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    gap: 5px;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
  </style>