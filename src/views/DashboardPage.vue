

<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片区 -->
    <el-row :gutter="20">
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #409EFF;">
              <i class="el-icon-document"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">项目总数</div>
              <div class="stat-value">{{ stats.projectCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #67C23A;">
              <i class="el-icon-success"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">接口数量</div>
              <div class="stat-value">{{ stats.projectCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #67C23A;">
              <i class="el-icon-success"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">通过率</div>
              <div class="stat-value">{{ stats.passRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #67C23A;">
              <i class="el-icon-success"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">可用数量</div>
              <div class="stat-value">{{ stats.passRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #E6A23C;">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">执行中</div>
              <div class="stat-value">{{ stats.runningCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #F56C6C;">
              <i class="el-icon-error"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">失败用例</div>
              <div class="stat-value">{{ stats.failedCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中部图表区 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart-title">最近7天执行趋势</div>
          <div ref="trendChart" style="height: 300px;"></div>
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
      <div class="table-header">
        <span class="table-title">最近执行记录</span>
        <el-button type="primary" size="small" @click="refreshData">刷新</el-button>
      </div>
      <el-table :data="recentExecutions" style="width: 100%">
        <el-table-column prop="projectName" label="项目名称" width="180"></el-table-column>
        <el-table-column prop="executor" label="执行人"></el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
        <el-table-column prop="duration" label="耗时(s)"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{row}">
            <el-button type="text" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface StatData {
  projectCount: number
  passRate: number
  runningCount: number
  failedCount: number
}

interface ExecutionRecord {
  id: string
  projectName: string
  executor: string
  startTime: string
  duration: number
  status: '成功' | '失败' | '执行中'
}

export default defineComponent({
  name: 'DashboardView',
  setup() {
    const stats = ref<StatData>({
      projectCount: 0,
      passRate: 0,
      runningCount: 0,
      failedCount: 0
    })

    const recentExecutions = ref<ExecutionRecord[]>([])
    const trendChart = ref<HTMLElement | null>(null)
    const pieChart = ref<HTMLElement | null>(null)
    let trendChartInstance: ECharts | null = null
    let pieChartInstance: ECharts | null = null

    // 初始化图表
    const initCharts = () => {
      if (trendChart.value) {
        trendChartInstance = echarts.init(trendChart.value)
        trendChartInstance.setOption({
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '执行次数',
              type: 'line',
              smooth: true,
              data: [120, 132, 101, 134, 90, 230, 210],
              itemStyle: {
                color: '#409EFF'
              }
            }
          ]
        })
      }

      if (pieChart.value) {
        pieChartInstance = echarts.init(pieChart.value)
        pieChartInstance.setOption({
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center'
          },
          series: [
            {
              name: '用例状态',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 735, name: '通过' },
                { value: 135, name: '失败' },
                { value: 130, name: '跳过' }
              ],
              color: ['#67C23A', '#F56C6C', '#E6A23C']
            }
          ]
        })
      }
    }

    // 获取状态标签类型
    const getStatusType = (status: string) => {
      switch (status) {
        case '成功':
          return 'success'
        case '失败':
          return 'danger'
        case '执行中':
          return 'warning'
        default:
          return ''
      }
    }

    // 查看详情
    const viewDetail = (row: ExecutionRecord) => {
      console.log('查看执行详情:', row)
      // 实际项目中这里可以跳转到详情页
    }

    // 刷新数据
    const refreshData = () => {
      loadMockData()
    }

    // 加载模拟数据
    const loadMockData = () => {
      stats.value = {
        projectCount: 28,
        passRate: 92.5,
        runningCount: 3,
        failedCount: 17
      }

      recentExecutions.value = [
        {
          id: '1',
          projectName: '用户中心API',
          executor: '张三',
          startTime: '2025-05-26 09:30:25',
          duration: 45,
          status: '成功'
        },
        {
          id: '2',
          projectName: '订单服务API',
          executor: '李四',
          startTime: '2025-05-26 10:15:12',
          duration: 128,
          status: '失败'
        },
        {
          id: '3',
          projectName: '支付网关API',
          executor: '王五',
          startTime: '2025-05-26 11:02:33',
          duration: 87,
          status: '执行中'
        },
        {
          id: '4',
          projectName: '商品服务API',
          executor: '赵六',
          startTime: '2025-05-25 16:45:18',
          duration: 56,
          status: '成功'
        },
        {
          id: '5',
          projectName: '物流跟踪API',
          executor: '钱七',
          startTime: '2025-05-25 14:30:42',
          duration: 93,
          status: '成功'
        }
      ]
    }

    onMounted(() => {
      loadMockData()
      initCharts()
      window.addEventListener('resize', () => {
        trendChartInstance?.resize()
        pieChartInstance?.resize()
      })
    })

    return {
      stats,
      recentExecutions,
      trendChart,
      pieChart,
      getStatusType,
      viewDetail,
      refreshData
    }
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
}
.stat-icon {
  font-size: 40px;
  margin-right: 20px;
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
