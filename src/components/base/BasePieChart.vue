<template>
  <div ref="chartRef" style="width: 200px; height: 200px;" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

interface Props {
  passed: number
  failed: number
}

const props = defineProps<Props>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const data = [
    { value: props.passed, name: '通过' },
    { value: props.failed, name: '失败' }
  ]

  const colors = ['#67C23A', '#F56C6C'] // 成功, 失败

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      // formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      // orient: 'vertical',
      left: 'center',
      data: data.map(d => d.name)
    },
    color: colors,
    series: [
      {
        name: '执行结果',
        type: 'pie',
        radius: '70%',
        // center: ['60%', '50%'],
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {d}%',
          fontSize: 14,
          show: false, // 👈 关键：显示标签
        },

        labelLine: {
          show: false // 👈 关键：隐藏连接线
        },
      }
    ]
  }

  chartInstance.setOption(option)
}

onMounted(renderChart)

watch(() => [props.passed, props.failed], () => {
  renderChart()
  console.log('Chart updated with new data:', props.passed, props.failed)
})
</script>
