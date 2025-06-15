<template>
  <el-container class="main-layout">
    <el-aside width="200px" class="sidebar">
    <el-menu
      default-active="dashboard"
      router
      class="el-menu-vertical-demo"
    >
      <el-menu-item index="/dashboard"><el-icon><PieChart /></el-icon>仪表盘</el-menu-item>
      <el-menu-item index="/interfaces">接口管理</el-menu-item>
      <el-menu-item index="/cases">用例管理</el-menu-item>
      <el-menu-item index="/suites">测试套件</el-menu-item>
      <el-menu-item index="/executions">执行记录</el-menu-item>
      <el-menu-item index="/settings">项目设置</el-menu-item>
    </el-menu>
    </el-aside>
    <el-container>
      <el-header>123</el-header>
      <el-main class="main-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>