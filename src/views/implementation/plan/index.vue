<script setup lang="ts">
import {ElMessage} from 'element-plus'
import type {ImplementationPlan} from '@/types/api'
import {implementationApi} from '@/api/implementation'
import {nodeApi} from '@/api/node'
import {extractData} from '@/utils/request'

const loading = ref(false)
const tableData = ref<ImplementationPlan[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const filters = reactive({
  nodeId: undefined as number | undefined,
  status: undefined as number | undefined,
})

const nodeTree = ref<any[]>([])

const statusMap: Record<number, { label: string; type: string }> = {
  0: {label: '待处理', type: 'info'},
  1: {label: '进行中', type: 'warning'},
  2: {label: '已完成', type: 'success'},
}

// 新增/编辑弹窗
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogTitle = ref('新增方案')
const formRef = ref()
const form = reactive({
  id: undefined as number | undefined,
  name: '',              // 对应后端实体 name
  description: '',
  deadline: '',         // 对应后端实体 deadline
  responsible: '',      // 对应后端实体 responsible
  nodeId: undefined as number | undefined,
  status: 0,
  parentId: 0,
})
const formRules = {
  name: [{required: true, message: '请输入方案名称', trigger: 'blur'}],
  deadline: [{required: true, message: '请选择截止日期', trigger: 'change'}],
}

// 详情弹窗
const detailVisible = ref(false)
const detailData = ref<ImplementationPlan | null>(null)

// 进度弹窗
const progressVisible = ref(false)
const progressForm = reactive({
  id: undefined as number | undefined,
  status: 0,
})
const statusOptions = [
  {label: '待处理', value: 0},
  {label: '进行中', value: 1},
  {label: '已完成', value: 2},
]

onMounted(async () => {
  await loadNodes()
  loadData()
})

async function loadNodes() {
  try {
    const res = await nodeApi.tree()
    nodeTree.value = extractData(res) ?? []
  } catch {/* ignore */}
}

async function loadData() {
  loading.value = true
  try {
    const res = await implementationApi.planTree({
      nodeId: filters.nodeId,
      status: filters.status,
    })
    const data = extractData(res) as ImplementationPlan[]
    tableData.value = data ?? []
    pagination.total = data?.length ?? 0
  } catch {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  pagination.page = 1
  loadData()
}

function onReset() {
  filters.nodeId = undefined
  filters.status = undefined
  onSearch()
}

function openAdd() {
  dialogTitle.value = '新增方案'
  Object.assign(form, {
    id: undefined,
    name: '',
    description: '',
    deadline: '',
    responsible: '',
    nodeId: undefined,
    status: 0,
    parentId: 0,
  })
  dialogVisible.value = true
}

function openEdit(row: ImplementationPlan) {
  dialogTitle.value = '编辑方案'
  Object.assign(form, {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    deadline: row.deadline ?? '',
    responsible: row.responsible ?? '',
    nodeId: row.nodeId,
    status: row.status ?? 0,
    parentId: row.parentId ?? 0,
  })
  dialogVisible.value = true
}

function openDetail(row: ImplementationPlan) {
  detailData.value = row
  detailVisible.value = true
}

function openProgress(row: ImplementationPlan) {
  progressForm.id = row.id
  progressForm.status = row.status ?? 0
  progressVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  dialogLoading.value = true
  try {
    const payload: Record<string, any> = {
      name: form.name,
      description: form.description || undefined,
      deadline: form.deadline || undefined,
      responsible: form.responsible || undefined,
      nodeId: form.nodeId,
      status: form.status,
      parentId: form.parentId,
    }
    if (form.id) {
      await implementationApi.updatePlan({ id: form.id, ...payload })
      ElMessage.success('更新成功')
    } else {
      await implementationApi.addPlan(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  } finally {
    dialogLoading.value = false
  }
}

async function submitProgress() {
  if (!progressForm.id) return
  loading.value = true
  try {
    await implementationApi.updatePlan({
      id: progressForm.id,
      status: progressForm.status,
    })
    ElMessage.success('进度更新成功')
    progressVisible.value = false
    loadData()
  } catch {
    ElMessage.error('更新失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(row: ImplementationPlan) {
  if (!row.id) return
  try {
    await implementationApi.deletePlan(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    ElMessage.error('删除失败')
  }
}

function findNodeName(id?: number): string {
  if (!id) return '-'
  function search(nodes: any[]): string {
    for (const n of nodes) {
      if (n.id === id) return n.name
      if (n.children?.length) {
        const found = search(n.children)
        if (found) return found
      }
    }
    return ''
  }
  return search(nodeTree.value) || '-'
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">实施方案</span>
      <div class="header-actions">
        <el-button type="primary" @click="openAdd">
          <el-icon><Plus/></el-icon> 新增方案
        </el-button>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="filter-bar">
      <el-select v-model="filters.nodeId" placeholder="筛选节点" clearable style="width: 200px">
        <el-option label="全部节点" :value="undefined"/>
        <el-option v-for="n in nodeTree" :key="n.id" :label="n.name" :value="n.id"/>
      </el-select>
      <el-select v-model="filters.status" placeholder="筛选状态" clearable style="width: 140px">
        <el-option label="全部状态" :value="undefined"/>
        <el-option v-for="(s, key) in statusMap" :key="key" :label="s.label" :value="Number(key)"/>
      </el-select>
      <el-button type="primary" @click="onSearch">搜索</el-button>
      <el-button @click="onReset">重置</el-button>
    </div>

    <!-- 表格 -->
    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="方案名称" min-width="200" show-overflow-tooltip/>
        <el-table-column label="关联节点" width="140">
          <template #default="{ row }">{{ findNodeName(row.nodeId) }}</template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip/>
        <el-table-column prop="deadline" label="截止日期" width="120"/>
        <el-table-column prop="responsible" label="负责人" width="100"/>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="(statusMap[row.status ?? 0] as any)?.type || 'info'" size="small">
              {{ (statusMap[row.status ?? 0] as any)?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDetail(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="warning" link size="small" @click="openProgress(row)">进度</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="方案名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入方案名称" maxlength="100" show-word-limit/>
        </el-form-item>
        <el-form-item label="关联节点">
          <el-select v-model="form.nodeId" placeholder="请选择节点" clearable style="width: 100%">
            <el-option v-for="n in nodeTree" :key="n.id" :label="n.name" :value="n.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="form.deadline"
            type="date"
            placeholder="选择截止日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.responsible" placeholder="请输入负责人"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入方案描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailVisible" title="方案详情" width="560px" destroy-on-close>
      <el-descriptions :column="1" border v-if="detailData">
        <el-descriptions-item label="方案名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="关联节点">{{ findNodeName(detailData.nodeId) }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ detailData.deadline ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ detailData.responsible ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="(statusMap[detailData.status ?? 0] as any)?.type || 'info'" size="small">
            {{ (statusMap[detailData.status ?? 0] as any)?.label || '未知' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detailData.description ?? '-' }}</el-descriptions-item>
        <el-descriptions-item v-if="detailData.feedback" label="最新反馈">
          <div>{{ detailData.feedback }}</div>
          <div class="feedback-meta">{{ detailData.feedbackTime }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 进度编辑弹窗 -->
    <el-dialog v-model="progressVisible" title="更新进度" width="400px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="当前状态">
          <el-select v-model="progressForm.status" style="width: 100%">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProgress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.header-actions {
  display: flex;
  gap: 8px;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.feedback-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>