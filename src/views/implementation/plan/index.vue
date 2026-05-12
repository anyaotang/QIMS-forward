<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { implementationApi, extractData } from '@/utils/request'
import type { ImplementationPlan } from '@/types/api'

const loading = ref(false)
const tableData = ref<ImplementationPlan[]>([])

const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待处理', type: 'info' },
  1: { label: '进行中', type: 'warning' },
  2: { label: '已完成', type: 'success' },
}

onMounted(loadData)

async function loadData() {
  loading.value = true
  try {
    const res = await implementationApi.planTree()
    tableData.value = extractData(res)
  } catch {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">实施方案</span>
    </div>

    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="title" label="方案标题" min-width="200" />
        <el-table-column prop="nodeName" label="关联节点" width="140" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="targetDate" label="目标日期" width="120" />
        <el-table-column prop="assignee" label="负责人" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="(statusMap[row.status ?? 0] as any)?.type || 'info'" size="small">
              {{ (statusMap[row.status ?? 0] as any)?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button type="primary" link size="small">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
