<template>
    <div class="cus-header">
      <!-- 品牌区域 -->
      <div class="brand">
        <img 
          v-if="logo" 
          :src="logo" 
          class="brand-logo"
          alt="品牌logo"
        >
        <span class="brand-text">{{ brandText || 'API 测试工具' }}</span>
      </div>
      <el-button type="primary" text class="suggestion" @click.stop="openDialog">优化建议</el-button>
      <el-dropdown trigger="click" placement="bottom-end">
        <!-- 用户信息 -->
        <span class="user-dropdown">
          <el-icon :size="18"><UserFilled /></el-icon>
          <span class="username">{{ userStore.usernameDisplay }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </span>
    
        <!-- 下拉菜单 -->
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleSettings">
              <template #icon>
                <el-icon><Setting /></el-icon>
              </template>
              设置
            </el-dropdown-item>
            
            <el-dropdown-item divided @click="userStore.logout">
              <template #icon>
                <el-icon><SwitchButton /></el-icon>
              </template>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

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
    </div>
  </template>
  
  <script setup lang="ts">
  import { 
    UserFilled,
    ArrowDown,
    Setting,
    SwitchButton
  } from '@element-plus/icons-vue'
  import { useUserStore } from '@/stores/user'
  import { ref,reactive } from 'vue'
  import { ElMessage, type FormInstance } from 'element-plus'

  const userStore = useUserStore()

  const logo = ref('https://ww2.sinaimg.cn/mw690/61d7678dgy1hvt194v9kqj20p00uuape.jpg')

  const brandText = ref('EasyAPI')
  
  // 处理设置
  const handleSettings = () => {
    console.log('打开设置页面')
  }
  

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
  
  /* 保持菜单项图标对齐 */
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .brand {
    margin-right: auto;
  }
  .cus-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 24px;
    border-bottom: 1px solid var(--el-border-color);
  }

  /* 品牌区域样式 */
.brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: auto;
}

.brand-logo {
    height: 32px;
    width: auto;
    object-fit: contain;
}

.brand-text {
    font-size: 18px;
    font-weight: 500;
    color: var(--el-text-color-primary);
}
.suggestion {
  font-size: large;
}
  </style>
