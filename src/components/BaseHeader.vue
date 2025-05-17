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
  import { ref } from 'vue'
  
  const userStore = useUserStore()

  const logo = ref('https://ww2.sinaimg.cn/mw690/61d7678dgy1hvt194v9kqj20p00uuape.jpg') // 替换为实际的logo地址
  const brandText = ref('EsayAPI')
  
  // 处理设置
  const handleSettings = () => {
    console.log('打开设置页面')
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
  </style>
