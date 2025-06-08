<template>
  <div>
    <div ref="trendChart" style="height: 300px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { dashboardApi } from '@/api'

const trendChart = ref(null)

interface ExecutionTrend {
  date: string
  total: number
  passed: number
  failed: number
}

const chartData = ref<ExecutionTrend[]>([])
let trendChartInstance: ECharts | null = null


const fetchChartData = async () => {
  try {
    const response = await dashboardApi.getRecent7DayHistorySummary()
    chartData.value = response.data.case_executions || []
    if (chartData.value.length) initCharts()  // 有数据才渲染
  } catch (error) {
    console.error('获取图表数据失败:', error)
  }
}

const initCharts = async () => {
  if (trendChart.value) {
    trendChartInstance = echarts.init(trendChart.value)
    trendChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
    },
    legend: { data: ['成功', '失败'] },
    xAxis: {
      type: 'category',
      data: chartData.value?.map(item => item.date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '成功',
        type: 'bar',
        stack: 'total',
        data: chartData.value?.map(item => item.passed),
        itemStyle: { color: '#67C23A' },
        label: {
          show: false,         // 开启显示
          position: 'top',    // 显示在柱体上方
          formatter: '{c}'    // 显示数据值
        }
      },
      {
        name: '失败',
        type: 'bar',
        stack: 'total',
        data: chartData.value?.map(item => item.failed),
        itemStyle: { color: '#F56C6C' },
        label: {
          show: false,         // 开启显示
          position: 'top',    // 显示在柱体上方
          formatter: '{c}'    // 显示数据值
        }
      },
    ]
  })
  }
}

onMounted(() => {
  fetchChartData()
  window.addEventListener('resize', () => {
    trendChartInstance?.resize()
  })
})
</script>

