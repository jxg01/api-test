<!-- <template> trader tools page </template> -->

<template>
  <div ref="chartDom" style="width: 600px; height: 400px"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chartDom = ref(null)
const props = defineProps({
  data: {
    type: Array,
    default: () => [
      // { name: '任务1', total: 100, success: 80 },
      // { name: '任务2', total: 150, success: 120 },
      {
                "date": "2025-05-30",
                "total": 0,
                "passed": 1,
                "failed": 0
            },
            {
                "date": "2025-05-31",
                "total": 25,
                "passed": 6,
                "failed": 19
            },
            {
                "date": "2025-06-01",
                "total": 0,
                "passed": 1,
                "failed": 0
            },
            {
                "date": "2025-06-02",
                "total": 5,
                "passed": 1,
                "failed": 3
            },
            {
                "date": "2025-06-03",
                "total": 12,
                "passed": 6,
                "failed": 5
            },
            {
                "date": "2025-06-04",
                "total": 0,
                "passed": 0,
                "failed": 0
            },
            {
                "date": "2025-06-05",
                "total": 0,
                "passed": 0,
                "failed": 0
            }
    ]
  }
})

onMounted(() => {
  console.log('Chart data:', props.data)
  const chart = echarts.init(chartDom.value)
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: { data: ['成功', '失败'] },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '成功',
        type: 'bar',
        stack: 'total',
        // barWidth: '50%',
        data: props.data.map(item => item.passed),
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
        data: props.data.map(item => item.failed),
        itemStyle: { color: '#F56C6C' },
        label: {
          show: false,         // 开启显示
          position: 'top',    // 显示在柱体上方
          formatter: '{c}'    // 显示数据值
        }
      },
    ]
  }
  chart.setOption(option)
})
</script>