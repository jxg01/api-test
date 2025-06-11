<template>
  <div class="python-page">
    <div class="title">
      <span>🚗 全局函数</span>
      <el-button type="primary" class="save-bt" @click="handleSavePython">保存</el-button>
    </div>
    <div class="example-tips">
      <span>* Example: {"password": "${login_name}", "username": "${__get_username(eddy)}"}</span>
    </div>
    <BaseEditor 
    lang="python" 
    v-model="pythonCode" 
    height="calc(100vh - 235px)"
    :options="{'tabSize': 4}"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseEditor from '@/components/BaseEditor.vue';
import { variableApi } from '@/api';
import { ElMessage } from 'element-plus/es';

const pythonCode = ref(`# 请输入python代码\n`);

const pythonCodeList = ref([
  {
    name: '第一个python代码',
    description: '全局Python代码',
    code: pythonCode.value,
  },
]);


const handleSavePython = async() => {
  try {
    const payload = {
      id: 1,
      name: 'python_code',
      description: '全局Python代码',
      code: pythonCode.value,
    };
    const response = await variableApi.updatePythonCode(payload.id, {
      python_code: pythonCode.value
    });
    if (response) {
      ElMessage.success('Python代码保存成功');
    } else {
      ElMessage.error('保存失败: ' + response);
    }
    fetchPythonCode(); // 重新获取最新的Python代码
  } catch (error) {
    console.error('Error saving Python code:', error);
    ElMessage.error('保存过程中发生错误: ' + error);
  }
}

const fetchPythonCode = async () => {
  try {
    const response = await variableApi.getPythonCodeList();
    if (response) {
      pythonCode.value = response.data[0].python_code || '';
    } else {
      ElMessage.error('获取Python代码失败: ' + response);
    }
  } catch (error) {
    ElMessage.error('获取Python代码时发生错误: ' + error);
  }
}

onMounted(() => {
  fetchPythonCode();
});

</script>

<style scoped>
.python-page {
  /* height: 100vh; */
}

.title {
  display: flex;
  justify-content: space-between;
  color: #000;
  margin: 10px 0;
}

.save-bt {
  margin-right: 30px;
}

.example-tips {
  display: flex;
  justify-content: flex-start;
  /* margin-bottom: 10px; */
  color: #000;
  font-size: 11px;
}
</style>
