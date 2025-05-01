<template>
    <div class="transaction-container">
      <!-- 左侧表单 -->
      <div class="left-panel">
        <el-card class="form-card">
            <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
                <el-tab-pane label="MT4" name="first">
                  <el-form :model="form" label-width="50px">
                    <el-form-item label="IP">
                      <el-input v-model="form.address" placeholder="请输入ip" />
                    </el-form-item>
                    
                    <el-form-item label="port">
                      <el-input v-model="form.account" placeholder="请输入port" />
                    </el-form-item>
                    
                    <el-form-item>
                      <el-button type="primary" @click="handleSubmit">Test</el-button>
                    </el-form-item>

                  </el-form>


                </el-tab-pane>
                <el-tab-pane label="MT5" name="second">Config</el-tab-pane>
            </el-tabs>

          <!-- <el-form :model="form" label-width="80px">
            <el-form-item label="地址">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item> -->

          
        </el-card>
      </div>
  
      <!-- 右侧日志 -->
      <div class="right-panel">
        <el-card class="log-card">
          <template #header>
            <div class="card-header">日志</div>
          </template>
          
          <div class="log-content">
            <div v-for="(log, index) in logs" :key="index" class="log-item">
              [{{ log.timestamp }}] {{ log.message }}
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { ElMessage, TabsPaneContext } from 'element-plus';
  
  interface LogEntry {
    timestamp: string;
    message: string;
  }
  
  // 表单数据
  const form = ref({
    address: '',
    account: ''
  });
  
  // 日志数据
  const logs = ref<LogEntry[]>([]);

  const tops = ref('top');
  const activeName = ref('first')

  const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
    }

  // 提交处理
  const handleSubmit = () => {
    if (!form.value.address || !form.value.account) {
      ElMessage({
        message: '请填写完整信息',
        type: 'success',
    })
      return;
    }
  
    // 模拟提交成功
    addLog('交易提交成功');
    // form.value = { address: '', account: '' };
  };
  
  // 添加日志方法
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    logs.value.push({ timestamp, message });
    
    // 自动滚动到底部
    nextTick(() => {
      const logContainer = document.querySelector('.log-content');
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    });
  };
  </script>
  
  <style scoped>
  .transaction-container {
    display: flex;
    height: calc(100vh - 120px);
    gap: 5px;
    padding: 5px;
  }
  
  .left-panel {
    flex: 1;
    max-width: 400px;
  }
  
  .right-panel {
    flex: 2;
  }
  
  .form-card,
  .log-card {
    height: 100%;
  }
  
  .log-content {
    height: 600px;
    overflow-y: auto;
    padding: 10px;
    background: #f8f8f8;
    border-radius: 4px;
  }
  
  .log-item {
    padding: 8px;
    margin: 4px 0;
    background: white;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .card-header {
    font-weight: bold;
    font-size: 16px;
  }


</style>