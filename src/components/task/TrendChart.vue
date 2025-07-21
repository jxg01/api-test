<template>
  <div class="detail-card">
    <div class="panel-header">近7天执行趋势</div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useTaskStore } from '@/stores/taskStore';
import { storeToRefs } from 'pinia';

const taskStore = useTaskStore();
const { selectedTask } = storeToRefs(taskStore);
const chart = ref<echarts.ECharts | null>(null);
const chartDom = ref<HTMLDivElement | null>(null);

const renderChart = () => {
  if (!chartDom.value) return;
  
  if (chart.value) {
    chart.value.dispose();
  }
  
  chart.value = echarts.init(chartDom.value);
  
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(`${date.getMonth()+1}-${date.getDate()}`);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['成功', '失败', '退出']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '执行次数'
    },
    series: [
      {
        name: '成功',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [5, 4, 7, 3, 6, 5, 4],
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '失败',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [0, 1, 0, 0, 0, 0, 1],
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '退出',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [0, 0, 0, 1, 0, 0, 0],
        itemStyle: { color: '#E6A23C' }
      }
    ]
  };
  
  chart.value.setOption(option);
};

const handleResize = () => {
  chart.value?.resize();
};

onMounted(() => {
  renderChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chart.value?.dispose();
});

// 当任务切换时重新渲染图表
watch(selectedTask, () => {
  nextTick(() => {
    renderChart();
  });
});
</script>

<style scoped>
.chart-container {
  height: 300px;
  width: 100%;
}

.panel-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
</style>