<template>
    <div class="project-selector">
      <div class="search-add">
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
  import { useProjectStore } from '@/stores/project'
  import { CirclePlusFilled } from '@element-plus/icons-vue'
  import BaseDialog from '@/components/BaseDialog.vue'
  import { ref, computed, markRaw, onMounted } from 'vue'
  import { ElMessage, ElSelect, ElInput } from 'element-plus/es'
  import { projectApi } from '@/api'
  
  const store = useInterfaceStore()
  const projectStore = useProjectStore()
  // 表单配置 =================================================================
  const dialogRef = ref()
  const formFields = ref(
    [
      { 
        prop: 'parent_module', 
        label: '上级模块',
        component: markRaw(ElSelect),
        onSelectChange: (val: number) => {
            store.selectedModuleId = val
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
      const payload = {
        name: data.name,
        project: projectStore.currentProjectId,
        parent_module: data.parent_module || null
      }
      await store.addModule(payload)
      store.fetchModules(payload.project)
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

  // 移除onMounted中的数据加载逻辑，避免与父组件重复调用接口
  // 数据加载由父组件InterfacePage.vue通过useProjectChangeListener统一管理
  onMounted(() => {
    console.log('ProjectSelector: 组件已挂载，数据加载由父组件InterfacePage统一处理')
  })

  
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