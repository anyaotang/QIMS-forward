<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { recordApi, nodeApi, inspectionItemApi, extractData } from '@/utils/request'
import type { InspectionRecord, NodeTreeNode, InspectionItem } from '@/types/api'

const loading = ref(false)
const tableData = ref<InspectionRecord[]>([])
const total = ref(0)
const nodeTree = ref<NodeTreeNode[]>([])
const itemList = ref<InspectionItem[]>([])
const queryForm = reactive({
  page: 1, pageSize: 10, keyword: '', nodeId: undefined as number | undefined,
  itemId: undefined as number | undefined, startDate: '', endDate: '',
})

onMounted(() => { loadTable(); loadNodeTree() })

async function loadNodeTree() {
  try { const res = await nodeApi.tree(); nodeTree.value = extractData(res) } catch {}
}

async function loadTable() {
  loading.value = true
  try {
    const res = await recordApi.page(queryForm)
    const data = extractData(res)
    tableData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function handleNodeChange(nodeId: number | undefined) {
  queryForm.nodeId = nodeId
  queryForm.itemId = undefined
  itemList.value = []
  if (nodeId) {
    try {
      const res = await inspectionItemApi.page({ page: 1, pageSize: 200, nodeId })
      const data = extractData(res)
      itemList.value = data.list
    } catch {}
  }
}

function onSearch() { queryForm.page = 1; loadTable() }
function onReset() {
  Object.assign(queryForm, { page: 1, pageSize: 10, keyword: '', nodeId: undefined, itemId: undefined, startDate: '', endDate: '' })
  itemList.value = []
  loadTable()
}

function getCellClass(row: InspectionRecord) {
  if (!row.isQualified) return 'cell-unqualified'
  const dv = row.deviation || 0
  if (Math.abs(dv) > (row.targetValue || 1) * 0.1) return 'cell-warn'
  return 'cell-qualified'
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">检测记录</span>
    </div>

    <div class="page-filter">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="节点">
          <el-tree-select v-model="queryForm.nodeId" :data="nodeTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择节点" clearable check-strictly style="width:160px"
            @change="handleNodeChange" />
        </el-form-item>
        <el-form-item label="检测项">
          <el-select v-model="queryForm.itemId" placeholder="请先选节点" clearable style="width:160px" :disabled="!queryForm.nodeId">
            <el-option v-for="item in itemList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker v-model="queryForm.startDate" type="date" placeholder="开始" value-format="YYYY-MM-DD" style="width:130px" />
          <span style="margin:0 4px">-</span>
          <el-date-picker v-model="queryForm.endDate" type="date" placeholder="结束" value-format="YYYY-MM-DD" style="width:130px" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="onSearch">搜索</el-button><el-button @click="onReset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe :row-class-name="(data: { row?: InspectionRecord }) => data.row?.isQualified ? '' : 'unqualified-row'">
        <el-table-column prop="itemName" label="检测项" min-width="160" />
        <el-table-column prop="nodeName" label="节点" width="130" />
        <el-table-column label="检测值" width="100">
          <template #default="{ row }"><span :class="getCellClass(row)">{{ row.value }}</span></template>
        </el-table-column>
        <el-table-column label="目标值" width="100">
          <template #default="{ row }">{{ row.targetValue }} {{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="偏差" width="90">
          <template #default="{ row }"><span :class="getCellClass(row)">{{ row.deviation }}</span></template>
        </el-table-column>
        <el-table-column label="是否合格" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isQualified ? 'success' : 'danger'" size="small">{{ row.isQualified ? '合格' : '不合格' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.dataSource === 0 ? '自动' : row.dataSource === 1 ? '半自动' : '手动' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inspector" label="检测人" width="100" />
        <el-table-column prop="recordTime" label="检测时间" width="170" />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      </el-table>

      <el-pagination style="margin-top:16px;justify-content:flex-end" :total="total"
        v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next"
        @change="loadTable" />
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.unqualified-row) {
  background: rgba(245, 108, 108, 0.04) !important;
}
</style>
