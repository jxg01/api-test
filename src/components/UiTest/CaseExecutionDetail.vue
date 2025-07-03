<template>
  <!-- 在其他页面调用这个组件 -->
  <div class="customer-header">
    <el-drawer
      v-model="drawerVisible"
      direction="rtl"
      size="900"
      @open="activeName='first'"
    >
      <template #header>
        <div class="customer-title" style="display: flex; text-align: center;">
          <svg style="margin-right: 10px; width: 24px; height: 24px;">
            <circle cx="12" cy="12" r="10 " :fill="status==='passed'?'lightgreen':'red'" />
          </svg>
          <h4>测试结果 - {{ title }}</h4>
        </div>
        
      </template>
      <div>
        <el-divider content-position="left"><b>用例步骤</b></el-divider>
        <el-collapse :expand-icon-position="'left'" accordion>
          <el-collapse-item
            v-for="(item, index) in popInfo || []"
            :key="index"
            :name="String(index)"
          >
            <template #title>
              <span :style="{ color: item.status === 'pass' ? 'green' : 'red' }">
                步骤{{ index+1 }}. {{ item.step.action }} 
              </span>
            </template>
            <div style="float: left; text-align: left;" class="request-detail">
              <span>日志: {{ item.log }}</span>
              <span v-if="item.error"><div></div>异常: {{ item.error }}</span>
              <span v-if="item.screenshot">
                <div></div>截图: 
                <a :href="baseFileUrl + item.screenshot " target="_blank">{{ baseFileUrl + item.screenshot }}</a>
              </span>
            </div>

          </el-collapse-item>
        </el-collapse>

        <el-divider content-position="left" style="margin-top: 80px;"><b>清理数据</b></el-divider>
        <div v-if="postSteps.length !== 0" class="request-detail">
          <el-collapse :expand-icon-position="'left'" accordion>
            <el-collapse-item
              v-for="(item, index) in postSteps || []"
              :key="index"
              :name="String(index)"
            >
              <template #title>
                <span>
                  sql结果 {{ index + 1 }}
                </span>
              </template>
              <div style="float: left; text-align: left;" class="request-detail">
                <span>SQL: {{ item.sql }}</span>
                <span>执行结果：{{ item.sql_result }}</span>
              </div>

            </el-collapse-item>
          </el-collapse>
        </div>
        <div v-else>
          <el-empty description="暂无数据" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const baseFileUrl = ref(import.meta.env.VITE_FILE_BASE_URL)

type executionDetail = {
  log: string
  step: {
    action: string, 
    url?: string, 
    seconds?: string,
    selector?: string,
    filePath?: string
  }
  status: string
  error?: string
  screenshot?: string
}

const drawerVisible = ref(false);
const loading = ref(false);
const activeName = ref('first')

const title = ref('Null')
const status = ref('passed')
const popInfo = ref<executionDetail[]>()
const postSteps = ref()

// 打开抽屉并加载数据
const openDrawer = async (row: any) => {
  loading.value = true;
  // console.log(row)
  popInfo.value = row.steps_log.steps_result
  drawerVisible.value = true;
  title.value = row.testcase_name
  status.value = row.status
  loading.value = false;
  postSteps.value = row.steps_log.post_steps_result
};

// 暴露打开方法供父组件调用
defineExpose({
  openDrawer
});
</script>

<style scoped>
.case-detail-drawer {
  /* padding: 20px; */
  height: 100%;
  overflow-y: auto;
}

:deep(.el-drawer__header) {
  background-color: #2f1b86;
  border-bottom: 1px solid #181717;
  margin-bottom: 0 0 12px;
  font-size: 18px;
  font-weight: bold;
  padding: 0 20px;
  color: #fff;
}

.customer-title {
  align-items: center;
}

.request-detail span {
  display: block; /* 将 span 设置为块级元素 */
  margin-bottom: 20px; /* 添加下方间距，避免内容过于紧凑 */
  /* border-bottom: 1px dotted #181717  ; */
  font-size: 14px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background-color: #ff5f56; }
.dot.yellow { background-color: #ffbd2e; }
.dot.green { background-color: #27c93f; }


.title-detail {
  /* color: red; */
  font-size: 24px;
}

</style>