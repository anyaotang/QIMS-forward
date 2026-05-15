<script setup lang="ts">
/**
 * 节点检测分布饼图
 */
import {use} from 'echarts/core'
import {PieChart} from 'echarts/charts'
import {TooltipComponent, LegendComponent} from 'echarts/components'
import {CanvasRenderer} from 'echarts/renderers'
import {WarningFilled} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

interface Props {
  data?: Array<{ name: string; value: number }>
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [
    {name: '产线A', value: 35},
    {name: '产线B', value: 28},
    {name: '产线C', value: 20},
    {name: '区域D', value: 10},
    {name: '其他', value: 7},
  ],
})

const hasError = ref(false)
// 炫酷渐变色配置
const COLORS = [
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#409eff' }, { offset: 1, color: '#79bbff' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#67c23a' }, { offset: 1, color: '#95d475' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#e6a23c' }, { offset: 1, color: '#eebe77' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#f56c6c' }, { offset: 1, color: '#f89898' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#909399' }, { offset: 1, color: '#b1b3b8' }] },
]

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => `${p.name}：${p.value} 次（${p.percent}%）`,
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textStyle: { color: '#fff', fontSize: 13 },
    extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);',
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
    textStyle: { color: '#606266', fontSize: 13, fontWeight: 500 },
    icon: 'roundRect',
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 3,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#303133',
        },
        itemStyle: {
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.4)',
        },
      },
      data: props.data.map((item, index) => ({
        ...item,
        itemStyle: {
          color: COLORS[index % COLORS.length],
        },
      })),
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
    console.error('[NodePieChart] 渲染失败:', e)
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