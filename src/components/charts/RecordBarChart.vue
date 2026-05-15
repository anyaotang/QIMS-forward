<script setup lang="ts">
/**
 * 检测记录柱状图
 * 展示近 N 天记录数量
 */
import {use} from 'echarts/core'
import {BarChart} from 'echarts/charts'
import {GridComponent, TooltipComponent} from 'echarts/components'
import {CanvasRenderer} from 'echarts/renderers'
import {WarningFilled} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

interface Props {
  /** 合格数量 */
  qualified?: number[]
  /** 不合格数量 */
  unqualified?: number[]
  /** X 轴标签 */
  dates?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  qualified: () => [45, 52, 38, 60, 55, 48, 62],
  unqualified: () => [3, 5, 2, 4, 6, 3, 5],
  dates: () => ['05-08', '05-09', '05-10', '05-11', '05-12', '05-13', '05-14'],
})

const hasError = ref(false)

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    formatter: (params: any[]) => {
      const d = params[0]
      return `${d.name}<br/>合格：<b style="color: #95d475;">${d.value}</b><br/>不合格：<b style="color: #f89898;">${(props.unqualified[props.dates.indexOf(d.name)] ?? 0)}</b>`
    },
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    borderColor: 'rgba(64, 158, 255, 0.5)',
    borderWidth: 1,
    padding: [10, 15],
    textStyle: { color: '#fff', fontSize: 13 },
    extraCssText: 'border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);',
  },
  grid: { left: 45, right: 20, top: 15, bottom: 30 },
  xAxis: {
    type: 'category',
    data: props.dates,
    axisLine: { lineStyle: { color: '#dcdfe6' } },
    axisLabel: { color: '#606266', fontSize: 12 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    axisLabel: { color: '#606266' },
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
      name: '合格',
      type: 'bar',
      stack: 'total',
      data: props.qualified,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#67c23a' },
            { offset: 1, color: '#95d475' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
        shadowBlur: 6,
        shadowColor: 'rgba(103, 194, 58, 0.3)',
      },
      barMaxWidth: 32,
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(103, 194, 58, 0.6)',
        },
      },
      animationDuration: 1200,
      animationEasing: 'cubicOut',
    },
    {
      name: '不合格',
      type: 'bar',
      stack: 'total',
      data: props.unqualified,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#f56c6c' },
            { offset: 1, color: '#f89898' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
        shadowBlur: 6,
        shadowColor: 'rgba(245, 108, 108, 0.3)',
      },
      barMaxWidth: 32,
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(245, 108, 108, 0.6)',
        },
      },
      animationDuration: 1200,
      animationEasing: 'cubicOut',
      animationDelay: 300,
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
    console.error('[RecordBarChart] 渲染失败:', e)
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