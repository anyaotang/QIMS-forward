<script setup lang="ts">
import {ElMessage} from 'element-plus'
import type {Statistics, InspectionRecord} from '@/types/api'
import {statisticsApi} from "@/api/statistics";
import {extractData} from "@/utils/request";
import {recordApi} from "@/api/record";

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

const recentRecords = ref<InspectionRecord[]>([])
const recordLoading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await statisticsApi.dashboard()
    stats.value = extractData(res)
  } catch {
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }

  recordLoading.value = true
  try {
    const res = await recordApi.page({page: 1, pageSize: 10})
    const data = extractData(res)
    recentRecords.value = data.list
  } catch {
    // ignore
  } finally {
    recordLoading.value = false
  }
})

const statCards = [
  {key: 'totalItems', label: '检测项总数', icon: 'DocumentChecked', color: '#409eff'},
  {key: 'activeItems', label: '活跃检测项', icon: 'Check', color: '#67c23a'},
  {key: 'qualifiedRate', label: '合格率(%)', icon: 'TrendCharts', color: '#e6a23c', suffix: '%'},
  {key: 'todayRecords', label: '今日记录', icon: 'Clock', color: '#f56c6c'},
  {key: 'unqualifiedCount', label: '不合格数', icon: 'Warning', color: '#f56c6c'},
  {key: 'nodeCount', label: '节点数量', icon: 'Connection', color: '#909399'},
]
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">仪表盘</span>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col v-for="card in statCards" :key="card.key" :xs="12" :sm="8" :md="6" :lg="4">
        <div class="stat-card" v-loading="loading">
          <div class="stat-icon" :style="{ background: card.color + '15', color: card.color }">
            <el-icon size="24">
              <component :is="card.icon"/>
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ (stats as any)[card.key] }}{{ card.suffix || '' }}
            </div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 最近检测记录 -->
    <div class="page-table" style="margin-top: 16px">
      <div class="table-header">
        <span class="page-title">最近检测记录</span>
      </div>

      <el-table :data="recentRecords" v-loading="recordLoading" stripe style="width: 100%">
        <el-table-column prop="itemName" label="检测项" min-width="160"/>
        <el-table-column prop="nodeName" label="节点" width="140"/>
        <el-table-column prop="value" label="检测值" width="100"/>
        <el-table-column prop="unit" label="单位" width="70"/>
        <el-table-column label="是否合格" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isQualified" type="success" size="small">合格</el-tag>
            <el-tag v-else type="danger" size="small">不合格</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inspector" label="检测人" width="100"/>
        <el-table-column prop="recordTime" label="检测时间" width="170"/>
      </el-table>
    </div>
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

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  .page-title {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
