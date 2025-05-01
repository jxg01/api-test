<template>
    <el-dropdown trigger="click" placement="bottom-end">
      <!-- 用户信息 -->
      <span class="user-dropdown">
        <el-icon :size="18"><UserFilled /></el-icon>
        <span class="username">{{ name }}</span>
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
          
          <el-dropdown-item divided @click="handleLogout">
            <template #icon>
              <el-icon><SwitchButton /></el-icon>
            </template>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </template>
  
  <script setup lang="ts">
  import { 
    UserFilled,
    ArrowDown,
    Setting,
    SwitchButton
  } from '@element-plus/icons-vue'
  
  const props = defineProps<{
    name: string
  }>()
  
  const emit = defineEmits<{
    (e: 'logout'): void
  }>()
  
  // 处理设置
  const handleSettings = () => {
    console.log('打开设置页面')
  }
  
  // 处理退出登录
  const handleLogout = () => {
    emit('logout')
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
  </style>
