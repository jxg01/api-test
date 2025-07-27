<template>
  <div class="detail-card">
    <div class="panel-header">近7天执行趋势</div>
    <VChart 
      class="chart-container" 
      :option="chartOption" 
      autoresize 
    />
  </div>
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { 
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import { storeToRefs } from 'pinia';

// 注册必要的组件
use([
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
]);

const taskStore = useTaskStore();
const { selectedTask } = storeToRefs(taskStore);

// 生成近7天日期
const generateDates = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(`${date.getMonth()+1}-${date.getDate()}`);
  }
  return dates;
};

// 图表配置
const chartOption = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['成功', '失败', '退出'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generateDates(),
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '执行次数',
      minInterval: 1
    },
    series: [
      {
        name: '成功',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [5, 4, 7, 3, 6, 5, 4],
        itemStyle: { color: '#67C23A' },
        label: {
          show: true,
          position: 'inside'
        }
      },
      {
        name: '失败',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [0, 1, 0, 0, 0, 0, 1],
        itemStyle: { color: '#F56C6C' },
        label: {
          show: true,
          position: 'inside'
        }
      },
      {
        name: '退出',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [0, 0, 0, 1, 0, 0, 0],
        itemStyle: { color: '#E6A23C' },
        label: {
          show: true,
          position: 'inside'
        }
      }
    ]
  };
});
</script>

<style scoped>
.chart-container {
  height: 250px;
  width: 100%;
}

.detail-card {
  height: 300px;
}

.panel-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #000;
}
</style>