<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { extractData } from '@/utils/request'
import type { QualityReport, NodeTreeNode, ReportQuery } from '@/types/api'
import { reportApi } from '@/api/report'
import { nodeApi } from '@/api/node'

const loading = ref(false)
const tableData = ref<QualityReport[]>([])
const total = ref(0)
const nodeTree = ref<NodeTreeNode[]>([])
const queryForm = reactive<ReportQuery>({
  page: 1,
  pageSize: 10,
  keyword: '',
  nodeId: undefined,
  itemId: undefined,
  startDate: '',
  endDate: '',
  isQualified: undefined,
})

onMounted(() => {
  loadTable()
  loadNodeTree()
})

async function loadNodeTree() {
  try {
    const res = await nodeApi.tree()
    nodeTree.value = extractData(res)
  } catch {}
}

async function loadTable() {
  loading.value = true
  try {
    const res = await reportApi.quality(queryForm)
    const data = extractData(res)
    tableData.value = data.records
    total.value = Number(data.total)
  } finally {
    loading.value = false
  }
}

function onSearch() {
  queryForm.page = 1
  loadTable()
}

function onReset() {
  Object.assign(queryForm, {
    page: 1,
    pageSize: 10,
    keyword: '',
    nodeId: undefined,
    itemId: undefined,
    startDate: '',
    endDate: '',
    isQualified: undefined,
  })
  loadTable()
}

async function handleExport() {
  try {
    const blob = await reportApi.export(queryForm)
    const url = URL.createObjectURL(
      new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `质量报表_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

function getCellClass(row: QualityReport) {
  if (!row.isQualified) return 'cell-unqualified'
  const dv = row.deviationRate || 0
  if (Math.abs(dv) > 10) return 'cell-warn'
  return 'cell-qualified'
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">质量报表</span>
      <el-button type="success" @click="handleExport">导出 Excel</el-button>
    </div>

    <div class="page-filter">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="节点">
          <el-tree-select
            v-model="queryForm.nodeId"
            :data="nodeTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择节点"
            clearable
            check-strictly
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="queryForm.startDate"
            type="date"
            placeholder="开始"
            value-format="YYYY-MM-DD"
            style="width: 130px"
          />
          <span style="margin: 0 4px">-</span>
          <el-date-picker
            v-model="queryForm.endDate"
            type="date"
            placeholder="结束"
            value-format="YYYY-MM-DD"
            style="width: 130px"
          />
        </el-form-item>
        <el-form-item label="合格状态">
          <el-select
            v-model="queryForm.isQualified"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="合格" :value="true" />
            <el-option label="不合格" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="itemName" label="检测项" min-width="160" />
        <el-table-column prop="nodeName" label="节点" width="130" />
        <el-table-column label="检测值" width="100">
          <template #default="{ row }"
            ><span :class="getCellClass(row)">{{ row.value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目标值" width="100">
          <template #default="{ row }">{{ row.targetValue }} {{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="偏差" width="90">
          <template #default="{ row }"
            ><span :class="getCellClass(row)">{{ row.deviation }}</span>
          </template>
        </el-table-column>
        <el-table-column label="偏差率(%)" width="100">
          <template #default="{ row }"
            ><span :class="getCellClass(row)">{{ row.deviationRate }}%</span></template
          >
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isQualified ? 'success' : 'danger'" size="small">
              {{ row.isQualified ? '合格' : '不合格' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inspector" label="检测人" width="100" />
        <el-table-column prop="recordTime" label="检测时间" width="170" />
      </el-table>

      <el-pagination
        style="margin-top: 16px; justify-content: flex-end"
        :total="total"
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @change="loadTable"
      />
    </div>
  </div>
</template>
