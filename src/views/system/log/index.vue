<script setup lang="ts">
import { extractData } from '@/utils/request'
import { logApi } from '@/api/log'
import type { LogInfo } from '@/types/api'

const loading = ref(false)
const tableData = ref<LogInfo[]>([])
const total = ref(0)
const modules = ref<string[]>([])
const expandedRows = ref<Set<number>>(new Set())

const queryForm = reactive({
  page: 1,
  pageSize: 20,
  module: '',
  keyword: '',
})

// Method tag color mapping
function getMethodColor(method: string) {
  const map: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info',
  }
  return map[method?.toUpperCase()] ?? 'info'
}

// Format duration
function formatDuration(ms: number | undefined) {
  if (ms == null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// Format JSON for display
function formatJson(str: string | undefined) {
  if (!str) return '-'
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

onMounted(() => {
  loadModules()
  loadTable()
})

async function loadModules() {
  try {
    const res = await logApi.modules()
    modules.value = extractData(res) ?? []
  } catch { /* ignore */
  }
}

async function loadTable() {
  loading.value = true
  try {
    const params = {
      page: queryForm.page,
      size: queryForm.pageSize,
      module: queryForm.module || undefined,
      keyword: queryForm.keyword || undefined,
    }
    const res = await logApi.page(params)
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
  Object.assign(queryForm, { page: 1, pageSize: 20, module: '', keyword: '' })
  loadTable()
}

function toggleExpand(row: LogInfo) {
  if (expandedRows.value.has(row.id)) {
    expandedRows.value.delete(row.id)
  } else {
    expandedRows.value.add(row.id)
  }
}

function isExpanded(row: LogInfo) {
  return expandedRows.value.has(row.id)
}
</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <span class="page-title">操作日志</span>
      <el-button text type="primary" @click="loadTable">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
    </div>

    <!-- Filter -->
    <div class="page-filter">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="模块">
          <el-select v-model="queryForm.module" placeholder="全部模块" clearable style="width:160px">
            <el-option v-for="m in modules" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="用户/描述/URL/IP"
            clearable
            style="width:200px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <div class="page-table">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        :expand-row-keys="Array.from(expandedRows)"
        row-key="id"
        @expand-change="toggleExpand"
      >
        <!-- Expand -->
        <el-table-column type="expand" width="50">
          <template #default="{ row }">
            <div class="log-detail">
              <el-row :gutter="24">
                <el-col :span="12">
                  <div class="detail-item">
                    <span class="detail-label">请求方法</span>
                    <el-tag :type="getMethodColor(row.method)" size="small">{{ row.method }}</el-tag>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="detail-item">
                    <span class="detail-label">请求地址</span>
                    <span class="detail-value mono">{{ row.url }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="detail-item">
                    <span class="detail-label">请求IP</span>
                    <span class="detail-value">{{ row.ip }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="detail-item">
                    <span class="detail-label">耗时</span>
                    <span class="detail-value">{{ formatDuration(row.duration) }}</span>
                  </div>
                </el-col>
                <el-col :span="24">
                  <div class="detail-item">
                    <span class="detail-label">请求参数</span>
                    <pre class="detail-code">{{ formatJson(row.params) }}</pre>
                  </div>
                </el-col>
                <el-col :span="24">
                  <div class="detail-item">
                    <span class="detail-label">返回结果</span>
                    <pre class="detail-code">{{ formatJson(row.result) }}</pre>
                  </div>
                </el-col>
              </el-row>
            </div>
          </template>
        </el-table-column>

        <!-- Columns -->
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="createTime" label="操作时间" width="170" />
        <el-table-column prop="username" label="操作用户" width="120" />
        <el-table-column prop="module" label="模块" width="130" />
        <el-table-column prop="description" label="操作描述" min-width="180" show-overflow-tooltip />
        <el-table-column label="方法" width="80">
          <template #default="{ row }">
            <el-tag :type="getMethodColor(row.method)" size="small">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="140" show-overflow-tooltip />
        <el-table-column label="耗时" width="90">
          <template #default="{ row }">
            <span :class="{ 'duration-warn': (row.duration ?? 0) > 3000 }">
              {{ formatDuration(row.duration) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="toggleExpand(row)">
              {{ isExpanded(row) ? '收起' : '详情' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top:16px;justify-content:flex-end"
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

<style scoped>
.log-detail {
  padding: 12px 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin: 4px 0;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

.detail-value.mono {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.detail-code {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  color: #606266;
  max-height: 200px;
  overflow: auto;
  margin: 4px 0 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.duration-warn {
  color: #e6a23c;
  font-weight: 500;
}
</style>
