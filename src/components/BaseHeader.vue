<template>
  <div class="header-content">
    <div class="current-project">
      <div>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" fill="#00FF00"/>
        </svg>
      </div>
      <CurrentProjectSelector />
    </div>

    <div class="right-header">
      <el-button type="primary" text class="suggestion" @click.stop="openDialog"><el-icon><PhoneFilled /></el-icon>优化建议</el-button>
      <el-dropdown>
        <span class="user-dropdown">
          <el-icon :size="18" color="blue"><UserFilled /></el-icon>
          <span class="username">{{ userStore.usernameDisplay }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </span>
        <!-- <el-avatar class="custom-avatar">{{ userStore.usernameDisplay }}</el-avatar> -->
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人设置</el-dropdown-item>
            <el-dropdown-item divided @click="userStore.logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <el-dialog v-model="dialogVisit" title="建议" width="30%" @closed="closeDialog">
    <el-form :model="form" ref="suggestionFormRef" :rules="rules">
      <el-form-item label="内容" prop="content">
        <el-input v-model="form.content" autocomplete="off" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary"  @click.stop="submit" >
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
  
  <script setup lang="ts">
  import { 
    UserFilled,
    ArrowDown,
  } from '@element-plus/icons-vue'
  import { useUserStore } from '@/stores/user'
  import { useProjectStore } from '@/stores/project'
  import { ref,reactive } from 'vue'
  import { ElMessage, type FormInstance } from 'element-plus'
  import CurrentProjectSelector from './CurrentProjectSelector.vue'

  const userStore = useUserStore()
  const store = useProjectStore()

const suggestionFormRef = ref<FormInstance>()
const form = reactive({
  content: '',
})
const dialogVisit = ref(false)
const rules = {
  content: [
    { required: true, message: '内容不能为空', trigger: 'blur' },
  ]
}

const openDialog = () => {
  console.log('project', store.current)
  dialogVisit.value = true
}
const submit = async() => {
  if (!form.content.trim()){ return }
  try {
    const res = await userStore.createUserSuggestion(form.content.trim())
    if (res) {
      ElMessage.success('创建成功')
      dialogVisit.value = false
    }
  } catch (error) {
    console.error(error)
  }
}

const closeDialog = () => {
  suggestionFormRef.value?.resetFields()
  dialogVisit.value = false
}




  </script>
  
  <style scoped>
  .current-project {
  display: flex;
  align-items: center; /* 内部元素垂直居中 */
  gap: 5px;
  min-width: 200px;
  height: 100%; /* 继承父容器高度 */
}

  .header-content {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 确保垂直居中 */
  width: 100%;
  height: 100%; /* 继承父容器高度 */
}
.right-header {
  display: flex;
  align-items: center; /* 内部元素垂直居中 */
  gap: 10px; /* 元素间距 */
  height: 100%; /* 继承父容器高度 */
}

.user-dropdown {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 21px 12px;
    height: 100%;
    cursor: pointer;
    transition: background-color 0.3s;
  
    /* &:hover {
      background-color: var(--el-color-primary-light-9);
    } */
  
    .username {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  
    .arrow-icon {
      margin-left: 4px;
      color: var(--el-text-color-secondary);
      transition: transform 0.3s;
    }
  }
  
  </style>
