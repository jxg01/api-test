<template>
  <el-card class="dashboard-container">
  <div>
    <!-- 顶部统计卡片区 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #409EFF;">
              <el-icon><Present /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">项目总数</div>
              <div class="stat-value">{{ stats?.projects }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #67C23A;">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">接口数量</div>
              <div class="stat-value">{{ stats?.interfaces }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #67C23A;">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">用例数量</div>
              <div class="stat-value">{{ stats?.testcases }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #67C23A;">
              <el-icon><Search /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">套件总数</div>
              <div class="stat-value">{{ stats?.testsuites }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中部图表区 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">最近7天用例执行</div>
          <ExecutionTrentChart  />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">用例状态分布</div>
          <div ref="pieChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部最近执行记录 -->
    <el-card shadow="hover" class="execution-table">
      <RecentExecutionTable />
    </el-card>
  </div>
</el-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { dashboardApi } from '@/api'
import ExecutionTrentChart from '@/components/dashboard/ExecutionTrentChart.vue'
import RecentExecutionTable from '@/components/dashboard/RecentExecutionTable.vue'

// 定义接口
interface StatData {
  projects: number
  interfaces: number
  testcases: number
  testsuites: number
}

// 响应式数据
const stats = ref<StatData>()
const pieChart = ref<HTMLElement | null>(null)

// 加载模拟数据
const fetchSummary = async() => {
  try {
    const response = await dashboardApi.getSummary()
    stats.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchSummary()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  min-width: 1000px;
}
.stat-card {
  display: flex;
  align-items: center;
}
.stat-icon {  
  font-size: 20px;
  margin-right: 10px;
}
.stat-content {
  flex: 1;
}
.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
}
.chart-row {
  margin-top: 20px;
  margin-bottom: 20px;
}
.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}
.execution-table {
  margin-top: 20px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.table-title {
  font-size: 16px;
  font-weight: bold;
}
</style>
