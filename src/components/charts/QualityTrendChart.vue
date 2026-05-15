<script setup lang="ts">
/**
 * 质量趋势折线图
 * 展示近 N 天合格率趋势
 */
import {use} from 'echarts/core'
import {LineChart} from 'echarts/charts'
import {GridComponent, TooltipComponent, LegendComponent} from 'echarts/components'
import {CanvasRenderer} from 'echarts/renderers'
import {WarningFilled} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

interface Props {
  /** 合格率数据（按天），数组索引 = 天偏移量 */
  data?: number[]
  /** X 轴标签（日期） */
  dates?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [92, 88, 95, 90, 94, 97, 93],
  dates: () => [],
})

const hasError = ref(false)

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any[]) => {
      const p = params[0]
      return `${p.name}<br/>合格率：<b style="color: #79bbff;">${p.value}%</b>`
    },
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    borderColor: 'rgba(64, 158, 255, 0.5)',
    borderWidth: 1,
    padding: [10, 15],
    textStyle: { color: '#fff', fontSize: 13 },
    extraCssText: 'border-radius: 8px; box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);',
  },
  grid: { left: 45, right: 20, top: 15, bottom: 30 },
  xAxis: {
    type: 'category',
    data: props.dates.length
      ? props.dates
      : ['05-08', '05-09', '05-10', '05-11', '05-12', '05-13', '05-14'],
    axisLine: { lineStyle: { color: '#dcdfe6' } },
    axisLabel: { color: '#606266', fontSize: 12 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    axisLabel: { color: '#606266', formatter: '{value}%' },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0',
        type: 'dashed',
      },
    },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  series: [
    {
      name: '合格率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: props.data,
      lineStyle: {
        color: '#409eff',
        width: 3,
        shadowBlur: 10,
        shadowColor: 'rgba(64, 158, 255, 0.5)',
      },
      itemStyle: {
        color: '#409eff',
        borderColor: '#fff',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: 'rgba(64, 158, 255, 0.5)',
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(64, 158, 255, 0.8)',
          scale: 1.5,
        },
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
            { offset: 0.5, color: 'rgba(64, 158, 255, 0.15)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.02)' },
          ],
        },
      },
      animationDuration: 1500,
      animationEasing: 'cubicOut',
    },
  ],
}))

const chartRef = ref<InstanceType<typeof VChart> | null>(null)
const resizeChart = () => {
  try {
    chartRef.value?.resize()
    hasError.value = false
  } catch (e) {
    hasError.value = true
    console.error('[QualityTrendChart] 渲染失败:', e)
  }
}
onMounted(() => {
  window.addEventListener('resize', resizeChart)
})
onUnmounted(() => window.removeEventListener('resize', resizeChart))
</script>

<template>
  <div v-if="hasError" class="chart-error">
    <el-icon size="24"><WarningFilled /></el-icon>
    <span>图表加载失败</span>
  </div>
  <v-chart
    v-else
    :option="option"
    ref="chartRef"
    autoresize
    style="height: 100%; width: 100%;"
    @error="hasError = true"
  />
</template>

<style scoped lang="scss">
.chart-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>