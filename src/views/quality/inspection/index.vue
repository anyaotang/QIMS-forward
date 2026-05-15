<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { extractData } from '@/utils/request'
import type {
  NodeTreeNode,
  InspectionItem,
  InspectionTask,
  InspectionTaskForm,
  InspectionTaskDetail,
  InspectionTaskItem,
} from '@/types/api'
import { inspectionTaskApi } from '@/api/inspectionTask'
import { inspectionItemApi } from '@/api/inspectionItem'
import { nodeApi } from '@/api/node'
import {
  Plus,
  Search,
  Refresh,
  View,
  Edit,
  Delete,
  VideoPlay,
  CircleCheck,
  CircleClose,
} from '@element-plus/icons-vue'

defineOptions({
  name: 'InspectionTask',
})

// ============ 列表状态 ============
const loading = ref(false)
const tableData = ref<InspectionTask[]>([])
const total = ref(0)
const nodeTree = ref<NodeTreeNode[]>([])

const queryForm = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  nodeId: null as number | null,
  status: null as number | null,
  startDate: '',
  endDate: '',
})

// 状态选项
const statusOptions = [
  { label: '待检测', value: 0, type: 'info' },
  { label: '检测中', value: 1, type: 'warning' },
  { label: '已完成', value: 2, type: 'success' },
  { label: '已取消', value: 3, type: 'danger' },
]

// ============ 新增/编辑弹窗 ============
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const formData = reactive<InspectionTaskForm>({
  name: '',
  code: '',
  nodeId: 0,
  planStartTime: '',
  planEndTime: '',
  inspector: '',
  remark: '',
  itemIds: [],
})
const formRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入任务编码', trigger: 'blur' }],
  nodeId: [{ required: true, message: '请选择检测节点', trigger: 'change' }],
}

// 节点下可选检测项
const availableItems = ref<InspectionItem[]>([])
const loadingItems = ref(false)

// ============ 详情抽屉 ============
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const taskDetail = ref<InspectionTaskDetail | null>(null)
const taskItems = ref<InspectionTaskItem[]>([])

// ============ 录入弹窗 ============
const recordDialogVisible = ref(false)
const recordFormRef = ref()
const recordForm = reactive({
  taskId: 0,
  itemId: 0,
  itemName: '',
  targetValue: 0,
  unit: '',
  upperLimit: 0,
  lowerLimit: 0,
  actualValue: 0,
  inspector: '',
  remark: '',
})
const recordRules = {
  actualValue: [{ required: true, message: '请输入检测值', trigger: 'blur' }],
}

// ============ 生命周期 ============
onMounted(() => {
  loadTable()
  loadNodeTree()
})

// ============ 列表方法 ============
async function loadTable() {
  loading.value = true
  try {
    const res = await inspectionTaskApi.page(queryForm)
    const data = extractData(res)
    tableData.value = data.records
    total.value = Number(data.total)
  } catch (e) {
    console.error('[Inspection] 加载任务列表失败:', e)
    tableData.value = []
  } finally {
    loading.value = false
  }
}

async function loadNodeTree() {
  try {
    const res = await nodeApi.tree()
    nodeTree.value = extractData(res) || []
  } catch {
    nodeTree.value = []
  }
}

function onSearch() {
  queryForm.page = 1
  loadTable()
}

function onReset() {
  Object.assign(queryForm, {
    page: 1,
    pageSize: 20,
    keyword: '',
    nodeId: null,
    status: null,
    startDate: '',
    endDate: '',
  })
  loadTable()
}

// ============ 新增/编辑 ============
function openAdd() {
  dialogTitle.value = '新增检测任务'
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    nodeId: 0,
    planStartTime: '',
    planEndTime: '',
    inspector: '',
    remark: '',
    itemIds: [],
  })
  availableItems.value = []
  dialogVisible.value = true
}

async function openEdit(row: InspectionTask) {
  dialogTitle.value = '编辑检测任务'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    nodeId: row.nodeId,
    planStartTime: row.planStartTime ?? '',
    planEndTime: row.planEndTime ?? '',
    inspector: row.inspector ?? '',
    remark: row.remark ?? '',
    itemIds: [],
  })
  // 加载节点下的检测项
  await loadItemsByNode(row.nodeId)
  dialogVisible.value = true
}

async function handleNodeSelect(nodeId: number) {
  formData.itemIds = []
  await loadItemsByNode(nodeId)
}

async function loadItemsByNode(nodeId: number) {
  if (!nodeId) {
    availableItems.value = []
    return
  }
  loadingItems.value = true
  try {
    const res = await inspectionItemApi.page({ page: 1, pageSize: 200, nodeId })
    const data = extractData(res)
    availableItems.value = data.records || []
  } catch {
    availableItems.value = []
  } finally {
    loadingItems.value = false
  }
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    if (formData.id) {
      await inspectionTaskApi.update(formData)
    } else {
      await inspectionTaskApi.create(formData)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadTable()
  } catch {
    // interceptor handles error
  }
}

// ============ 任务操作 ============
async function handleStart(row: InspectionTask) {
  await ElMessageBox.confirm('确定启动该检测任务？', '提示', { type: 'warning' })
  try {
    await inspectionTaskApi.start(row.id)
    ElMessage.success('任务已启动')
    loadTable()
  } catch {
    // interceptor
  }
}

async function handleComplete(row: InspectionTask) {
  await ElMessageBox.confirm('确定完成该检测任务？完成后将无法再录入数据。', '提示', {
    type: 'warning',
  })
  try {
    await inspectionTaskApi.complete(row.id)
    ElMessage.success('任务已完成')
    loadTable()
  } catch {
    // interceptor
  }
}

async function handleCancel(row: InspectionTask) {
  await ElMessageBox.confirm('确定取消该检测任务？', '提示', { type: 'warning' })
  try {
    await inspectionTaskApi.cancel(row.id)
    ElMessage.success('任务已取消')
    loadTable()
  } catch {
    // interceptor
  }
}

async function handleDelete(row: InspectionTask) {
  await ElMessageBox.confirm('确定删除该检测任务？', '提示', { type: 'warning' })
  try {
    await inspectionTaskApi.delete(row.id)
    ElMessage.success('删除成功')
    loadTable()
  } catch {
    // interceptor
  }
}

// ============ 查看详情 ============
async function openDetail(row: InspectionTask) {
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    const res = await inspectionTaskApi.detail(row.id)
    taskDetail.value = extractData(res)
    taskItems.value = taskDetail.value?.items || []
  } catch (e) {
    console.error('[Inspection] 加载任务详情失败:', e)
    taskDetail.value = null
    taskItems.value = []
  } finally {
    drawerLoading.value = false
  }
}

// ============ 录入检测值 ============
function openRecord(item: InspectionTaskItem) {
  Object.assign(recordForm, {
    taskId: item.taskId,
    itemId: item.itemId,
    itemName: item.itemName,
    targetValue: item.targetValue ?? 0,
    unit: item.unit ?? '',
    upperLimit: item.upperLimit ?? 0,
    lowerLimit: item.lowerLimit ?? 0,
    actualValue: item.actualValue ?? 0,
    inspector: '',
    remark: '',
  })
  recordDialogVisible.value = true
}

async function handleRecord() {
  const valid = await recordFormRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    await inspectionTaskApi.recordItem(recordForm.taskId, {
      itemId: recordForm.itemId,
      actualValue: recordForm.actualValue,
      inspector: recordForm.inspector,
      remark: recordForm.remark,
    })
    ElMessage.success('录入成功')
    recordDialogVisible.value = false
    // 刷新详情
    if (taskDetail.value) {
      openDetail(taskDetail.value)
    }
    loadTable()
  } catch {
    // interceptor
  }
}

// ============ 工具方法 ============
function getStatusTag(status: number) {
  return statusOptions.find((s) => s.value === status) || statusOptions[0]
}

function getQualifiedRate(row: InspectionTask) {
  if (!row.totalItems) return '-'
  const rate = ((row.qualifiedCount / row.totalItems) * 100).toFixed(1)
  return `${rate}%`
}

function getQualifiedRateClass(row: InspectionTask) {
  if (!row.totalItems) return ''
  const rate = row.qualifiedCount / row.totalItems
  if (rate >= 0.95) return 'cell-qualified'
  if (rate >= 0.8) return 'cell-warn'
  return 'cell-unqualified'
}

function getItemStatusTag(status: number) {
  const map: Record<number, { label: string; type: string }> = {
    0: { label: '待检测', type: 'info' },
    1: { label: '已检测', type: 'success' },
    2: { label: '跳过', type: 'warning' },
  }
  return map[status] || { label: '未知', type: 'info' }
}
</script>

<template>
  <div class="page-container">
    <!-- 页头 -->
    <div class="page-header">
      <span class="page-title">检测任务</span>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增任务</el-button>
    </div>

    <!-- 搜索筛选 -->
    <div class="page-filter">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="任务名称/编码"
            clearable
            style="width: 180px"
            @keyup.enter="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="检测节点">
          <el-tree-select
            v-model="queryForm.nodeId"
            :data="nodeTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="全部节点"
            clearable
            check-strictly
            style="width: 170px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            placeholder="全部状态"
            clearable
            style="width: 130px"
          >
            <el-option
              v-for="s in statusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="queryForm.startDate"
            type="date"
            placeholder="开始日期"
            value-format="YYYY-MM-DD"
            style="width: 140px"
          />
          <span style="margin: 0 4px; color: #c0c4cc">—</span>
          <el-date-picker
            v-model="queryForm.endDate"
            type="date"
            placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 任务列表 -->
    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="code" label="任务编码" width="140" show-overflow-tooltip />
        <el-table-column prop="name" label="任务名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="nodeName" label="检测节点" width="130" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="120" align="center">
          <template #default="{ row }">
            <span style="font-size: 13px"> {{ row.completedItems }} / {{ row.totalItems }} </span>
          </template>
        </el-table-column>
        <el-table-column label="合格率" width="90" align="center">
          <template #default="{ row }">
            <span :class="getQualifiedRateClass(row)">
              {{ getQualifiedRate(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="inspector" label="检测人" width="90" />
        <el-table-column label="计划时间" width="170">
          <template #default="{ row }">
            <div style="font-size: 12px; line-height: 1.6">
              <div v-if="row.planStartTime">{{ row.planStartTime }}</div>
              <div v-if="row.planEndTime" style="color: #909399">~ {{ row.planEndTime }}</div>
              <span v-if="!row.planStartTime && !row.planEndTime" style="color: #c0c4cc">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />

        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="View" @click="openDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="warning"
              link
              size="small"
              :icon="VideoPlay"
              @click="handleStart(row)"
            >
              启动
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="primary"
              link
              size="small"
              :icon="Edit"
              @click="openEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 1"
              type="success"
              link
              size="small"
              :icon="CircleCheck"
              @click="handleComplete(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="row.status === 0 || row.status === 1"
              type="danger"
              link
              size="small"
              :icon="CircleClose"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="640px"
      destroy-on-close
      @close="formRef?.resetFields()"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="任务名称" prop="name">
              <el-input v-model="formData.name" placeholder="如：2026年5月产线A巡检" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务编码" prop="code">
              <el-input v-model="formData.code" placeholder="如：INS-20260515-001" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="检测节点" prop="nodeId">
          <el-tree-select
            v-model="formData.nodeId"
            :data="nodeTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择检测节点"
            clearable
            check-strictly
            style="width: 100%"
            @change="handleNodeSelect"
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="计划开始">
              <el-date-picker
                v-model="formData.planStartTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划结束">
              <el-date-picker
                v-model="formData.planEndTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="检测人">
          <el-input v-model="formData.inspector" placeholder="负责人姓名" />
        </el-form-item>

        <!-- 检测项选择 -->
        <el-form-item label="检测项">
          <div v-if="!formData.nodeId" style="color: #909399; font-size: 13px">
            请先选择检测节点
          </div>
          <el-checkbox-group
            v-else
            v-model="formData.itemIds"
            v-loading="loadingItems"
            style="width: 100%"
          >
            <el-row :gutter="8">
              <el-col
                v-for="item in availableItems"
                :key="item.id"
                :span="12"
                style="margin-bottom: 4px"
              >
                <el-checkbox :value="item.id" :label="item.id">
                  <span>{{ item.name }}</span>
                  <span style="color: #909399; font-size: 12px; margin-left: 4px">
                    ({{ item.code }})
                  </span>
                </el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="检测任务详情" size="640px" destroy-on-close>
      <div v-loading="drawerLoading">
        <template v-if="taskDetail">
          <!-- 基本信息 -->
          <el-descriptions :column="2" border size="small" style="margin-bottom: 20px">
            <el-descriptions-item label="任务编码">{{ taskDetail.code }}</el-descriptions-item>
            <el-descriptions-item label="任务名称">{{ taskDetail.name }}</el-descriptions-item>
            <el-descriptions-item label="检测节点">{{ taskDetail.nodeName }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTag(taskDetail.status).type" size="small">
                {{ getStatusTag(taskDetail.status).label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="检测人">{{
              taskDetail.inspector || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="合格率">
              <span :class="getQualifiedRateClass(taskDetail)">
                {{ getQualifiedRate(taskDetail) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="计划时间" :span="2">
              {{ taskDetail.planStartTime || '-' }} ~ {{ taskDetail.planEndTime || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ taskDetail.remark || '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 进度条 -->
          <div style="margin-bottom: 20px">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px">
              <span style="font-size: 13px; font-weight: 500">检测进度</span>
              <span style="font-size: 13px; color: #909399">
                {{ taskDetail.completedItems }} / {{ taskDetail.totalItems }}
              </span>
            </div>
            <el-progress
              :percentage="
                taskDetail.totalItems
                  ? Math.round((taskDetail.completedItems / taskDetail.totalItems) * 100)
                  : 0
              "
              :color="taskDetail.unqualifiedCount > 0 ? '#e6a23c' : '#409eff'"
            />
          </div>

          <!-- 检测项列表 -->
          <h4 style="margin-bottom: 12px; font-size: 14px">检测项明细</h4>
          <el-table :data="taskItems" size="small" stripe border>
            <el-table-column prop="itemCode" label="编码" width="110" />
            <el-table-column prop="itemName" label="名称" min-width="120" show-overflow-tooltip />
            <el-table-column label="目标值" width="90" align="center">
              <template #default="{ row }"> {{ row.targetValue }} {{ row.unit }} </template>
            </el-table-column>
            <el-table-column label="范围" width="120" align="center">
              <template #default="{ row }">
                <span style="font-size: 12px">{{ row.lowerLimit }} ~ {{ row.upperLimit }}</span>
              </template>
            </el-table-column>
            <el-table-column label="检测值" width="90" align="center">
              <template #default="{ row }">
                <span
                  v-if="row.status === 1"
                  :class="row.isQualified ? 'cell-qualified' : 'cell-unqualified'"
                >
                  {{ row.actualValue }}
                </span>
                <span v-else style="color: #c0c4cc">-</span>
              </template>
            </el-table-column>
            <el-table-column label="偏差" width="80" align="center">
              <template #default="{ row }">
                <span
                  v-if="row.status === 1"
                  :class="row.isQualified ? 'cell-qualified' : 'cell-unqualified'"
                >
                  {{ row.deviation }}
                </span>
                <span v-else style="color: #c0c4cc">-</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getItemStatusTag(row.status).type" size="small">
                  {{ getItemStatusTag(row.status).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 0 && taskDetail?.status === 1"
                  type="primary"
                  link
                  size="small"
                  @click="openRecord(row)"
                >
                  录入
                </el-button>
                <el-tag
                  v-else-if="row.status === 1"
                  :type="row.isQualified ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.isQualified ? '合格' : '不合格' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <el-empty v-else description="暂无数据" />
      </div>
    </el-drawer>

    <!-- 录入检测值弹窗 -->
    <el-dialog v-model="recordDialogVisible" title="录入检测值" width="480px" destroy-on-close>
      <el-form ref="recordFormRef" :model="recordForm" :rules="recordRules" label-width="100px">
        <el-form-item label="检测项">
          <span>{{ recordForm.itemName }}</span>
        </el-form-item>
        <el-form-item label="目标值">
          <span>{{ recordForm.targetValue }} {{ recordForm.unit }}</span>
        </el-form-item>
        <el-form-item label="标准范围">
          <span>{{ recordForm.lowerLimit }} ~ {{ recordForm.upperLimit }}</span>
        </el-form-item>
        <el-form-item label="检测值" prop="actualValue">
          <el-input-number
            v-model="recordForm.actualValue"
            :precision="3"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="检测人">
          <el-input v-model="recordForm.inspector" placeholder="可选" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRecord">确认录入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-drawer__body) {
  padding: 16px 20px;
}
</style>
