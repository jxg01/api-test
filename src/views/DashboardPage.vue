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
import { onMounted, ref, watch } from 'vue'
import { dashboardApi } from '@/api'
import { useProjectStore } from '@/stores/project'

interface StatData {
  projects: number
  interfaces: number
  testcases: number
  testsuites: number
}

const stats = ref<StatData | null>(null)
const projectStore = useProjectStore()

async function fetchSummary() {
  const pid = projectStore.currentProjectId
  if (!pid) {
    stats.value = null
    return
  }
  // 如果后端支持按项目统计，建议带上 project_id
  // const res = await dashboardApi.getSummary({ project_id: pid })
  const res = await dashboardApi.getSummary()
  stats.value = res?.data ?? null
}

// ✅ 当项目切换时自动刷新；首次立即执行
watch(() => projectStore.currentProjectId, () => { fetchSummary() }, { immediate: true })

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
