<template>
  <div class="detail-card">
    <div class="panel-header">近7次执行趋势</div>
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
import { ref, computed } from 'vue';
import type { ExecutionLog } from '@/stores/tasksStore';

// 注册必要的组件
use([
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
]);

const props = defineProps<{
  // 接收执行历史数据
  history?: ExecutionLog[];
}>();

// 获取最近7次执行记录并处理成图表数据
const chartData = computed(() => {
  if (!props.history || props.history.length === 0) {
    // 如果没有数据，返回模拟数据
    return {
      dates: ['', '', '', '', '', '', ''],
      successData: [0, 0, 0, 0, 0, 0, 0],
      failData: [0, 0, 0, 0, 0, 0, 0],
      exitData: [0, 0, 0, 0, 0, 0, 0]
    };
  }

  // 取最近的7条记录，按时间倒序排列
  const latest7Records = props.history.slice(0, 7).reverse();
  
  // 提取日期和状态数据
  const dates = latest7Records.map(record => {
    const date = new Date(record.created_at);
    return `${date.getMonth() + 1}-${date.getDate()}`;
  });

  const successData = latest7Records.map(record => {
    // 已完成状态且通过率为100%算成功
    return record.passed;
  });

  const failData = latest7Records.map(record => {
    // 失败状态或已完成但通过率不是100%算失败
    return record.failed;
  });

  const exitData = latest7Records.map(record => {
    // 运行中状态算退出
    return record.status === 'running' ? 1 : 0;
  });

  return {
    dates,
    successData,
    failData,
    exitData
  };
});

// 图表配置
const chartOption = computed(() => {
  const data = chartData.value;
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['成功', '失败'],
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
      data: data.dates,
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
        data: data.successData,
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
        data: data.failData,
        itemStyle: { color: '#F56C6C' },
        label: {
          show: true,
          position: 'inside'
        }
      }
      // {
      //   name: '退出',
      //   type: 'bar',
      //   stack: 'total',
      //   emphasis: { focus: 'series' },
      //   data: data.exitData,
      //   itemStyle: { color: '#E6A23C' },
      //   label: {
      //     show: true,
      //     position: 'inside'
      //   }
      // }
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