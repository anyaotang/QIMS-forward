<script setup lang="ts">
import { extractData } from '@/utils/request'
import type { Statistics, NodeTreeNode } from '@/types/api'
import { statisticsApi } from '@/api/statistics'
import { nodeApi } from '@/api/node'
import QualityTrendChart from '@/components/charts/QualityTrendChart.vue'
import NodePieChart from '@/components/charts/NodePieChart.vue'
import RecordBarChart from '@/components/charts/RecordBarChart.vue'

const loading = ref(false)
const stats = ref<Statistics>({
  totalItems: 0,
  activeItems: 0,
  qualifiedRate: 0,
  todayRecords: 0,
  unqualifiedCount: 0,
  nodeCount: 0,
  departmentCount: 0,
})

const nodeTree = ref<NodeTreeNode[]>([])

// 图表数据
const trendDates = ref<string[]>([])
const trendData = ref<number[]>([])
const recordQualified = ref<number[]>([])
const recordUnqualified = ref<number[]>([])
const nodePieData = ref<Array<{ name: string; value: number }>>([])

onMounted(async () => {
  loadNodeTree()
  await loadStatistics()
})

async function loadNodeTree() {
  try {
    const res = await nodeApi.tree()
    nodeTree.value = extractData(res) || []
    // 节点分布饼图
    nodePieData.value = flattenNodes(nodeTree.value).slice(0, 8).map(n => ({
      name: n.name || '未知',
      value: Math.floor(Math.random() * 30) + 5, // TODO: 后端提供真实数据
    }))
  } catch {}
}

async function loadStatistics() {
  loading.value = true
  try {
    const res = await statisticsApi.dashboard()
    stats.value = extractData(res) || getDefaultStats()

    // 合格率趋势（模拟近7日）
    const now = new Date()
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${m}-${day}`
    })
    trendDates.value = dates
    const baseRate = stats.value.qualifiedRate || 93
    trendData.value = [
      baseRate - 3,
      baseRate - 1,
      baseRate + 2,
      baseRate - 2,
      baseRate + 1,
      baseRate + 3,
      baseRate,
    ]
    const baseRecords = stats.value.todayRecords || 50
    recordQualified.value = Array.from({ length: 7 }, () =>
      Math.floor(baseRecords * (0.85 + Math.random() * 0.15)),
    )
    recordUnqualified.value = recordQualified.value.map(q =>
      Math.max(0, Math.floor(q * (1 - (baseRate / 100)) + (Math.random() - 0.5) * 3)),
    )
  } catch {
    stats.value = getDefaultStats()
  } finally {
    loading.value = false
  }
}

function getDefaultStats(): Statistics {
  return {
    totalItems: 0,
    activeItems: 0,
    qualifiedRate: 0,
    todayRecords: 0,
    unqualifiedCount: 0,
    nodeCount: 0,
    departmentCount: 0,
  }
}

function flattenNodes(nodes: NodeTreeNode[]): NodeTreeNode[] {
  const result: NodeTreeNode[] = []
  for (const n of nodes) {
    result.push(n)
    if (n.children?.length) result.push(...flattenNodes(n.children))
  }
  return result
}

const statCards = [
  { key: 'totalItems', label: '检测项总数', icon: 'DocumentChecked', color: '#409eff' },
  { key: 'activeItems', label: '活跃检测项', icon: 'Check', color: '#67c23a' },
  { key: 'qualifiedRate', label: '合格率(%)', icon: 'TrendCharts', color: '#e6a23c', suffix: '%' },
  { key: 'todayRecords', label: '今日记录', icon: 'Clock', color: '#f56c6c' },
  { key: 'unqualifiedCount', label: '不合格数', icon: 'Warning', color: '#f56c6c' },
  { key: 'nodeCount', label: '节点数量', icon: 'Connection', color: '#909399' },
  { key: 'departmentCount', label: '部门数量', icon: 'OfficeBuilding', color: '#9b59b6' },
]
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">统计分析</span>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col v-for="card in statCards" :key="card.key" :xs="12" :sm="8" :md="6" :lg="4">
        <div class="stat-card" v-loading="loading">
          <div class="stat-icon" :style="{ background: card.color + '15', color: card.color }">
            <el-icon size="24">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ (stats as any)[card.key] }}{{ card.suffix || '' }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :xs="24" :lg="14">
        <div class="chart-card">
          <div class="chart-title">合格率趋势（近7日）</div>
          <QualityTrendChart :dates="trendDates" :data="trendData" style="height: 260px" />
        </div>
        <div class="chart-card" style="margin-top: 16px">
          <div class="chart-title">近7日检测记录</div>
          <RecordBarChart
            :dates="trendDates"
            :qualified="recordQualified"
            :unqualified="recordUnqualified"
            style="height: 260px"
          />
        </div>
      </el-col>
      <el-col :xs="24" :lg="10">
        <div class="chart-card" style="height: 552px">
          <div class="chart-title">节点检测分布</div>
          <NodePieChart :data="nodePieData" style="height: 490px" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.stat-cards {
  margin-bottom: 8px;
}

.stat-card {
  background: var(--qims-card-bg);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow 0.2s;
  cursor: default;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.chart-card {
  background: var(--qims-card-bg);
  border-radius: 8px;
  padding: 16px 20px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}
</style>
