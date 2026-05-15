<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { extractData } from '@/utils/request'
import type { InspectionItem, NodeTreeNode, InspectionItemForm } from '@/types/api'
import { inspectionItemApi } from '@/api/inspectionItem'
import { nodeApi } from '@/api/node'

const loading = ref(false)
const tableData = ref<InspectionItem[]>([])
const total = ref(0)
const nodeTree = ref<NodeTreeNode[]>([])
const queryForm = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  nodeId: undefined as number | undefined,
  dataSource: undefined as number | undefined,
})
const dialogVisible = ref(false)
const formRef = ref()
const formData = reactive<InspectionItemForm>({
  name: '',
  code: '',
  nodeId: undefined,
  targetValue: undefined,
  unit: '',
  upperLimit: undefined,
  lowerLimit: undefined,
  dataSource: 2,
  cronExpression: '',
  isActive: true,
  formula: '',
  defaultValueGroup: '',
  pushCondition: '',
  remark: '',
})

const rules = {
  name: [{ required: true, message: '请输入检测项名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入检测项编码', trigger: 'blur' }],
}

const dataSourceOptions = [
  { label: '自动采集', value: 0 },
  { label: '半自动', value: 1 },
  { label: '手动录入', value: 2 },
]

onMounted(() => {
  loadTable()
  loadNodeTree()
})

async function loadTable() {
  loading.value = true
  try {
    const res = await inspectionItemApi.page(queryForm)
    const data = extractData(res)
    tableData.value = data.records
    total.value = Number(data.total)
  } finally {
    loading.value = false
  }
}

async function loadNodeTree() {
  try {
    const res = await nodeApi.tree()
    nodeTree.value = extractData(res)
  } catch {
    /* ignore */
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
    dataSource: undefined,
  })
  loadTable()
}

function openAdd() {
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    nodeId: undefined,
    targetValue: undefined,
    unit: '',
    upperLimit: undefined,
    lowerLimit: undefined,
    dataSource: 2,
    cronExpression: '',
    isActive: true,
    formula: '',
    defaultValueGroup: '',
    pushCondition: '',
    remark: '',
  })
  dialogVisible.value = true
}

function openEdit(row: InspectionItem) {
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    nodeId: row.nodeId,
    targetValue: row.targetValue,
    unit: row.unit || '',
    upperLimit: row.upperLimit,
    lowerLimit: row.lowerLimit,
    dataSource: row.dataSource,
    cronExpression: row.cronExpression || '',
    isActive: row.isActive,
    formula: row.formula || '',
    defaultValueGroup: row.defaultValueGroup || '',
    pushCondition: row.pushCondition || '',
    remark: row.remark || '',
  })
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (formData.id) {
      await inspectionItemApi.update(formData)
    } else {
      await inspectionItemApi.create(formData)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadTable()
  } catch {
    /* interceptor */
  }
}

async function handleDelete(row: InspectionItem) {
  await ElMessageBox.confirm('确定删除该检测项？', '提示', { type: 'warning' })
  await inspectionItemApi.delete(row.id)
  ElMessage.success('删除成功')
  loadTable()
}

async function handleToggleActive(row: InspectionItem) {
  await inspectionItemApi.toggleActive(row.id, !row.isActive)
  ElMessage.success(row.isActive ? '已停用' : '已激活')
  loadTable()
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">检测项管理</span>
      <el-button type="primary" @click="openAdd">新增检测项</el-button>
    </div>

    <div class="page-filter">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="名称/编码"
            clearable
            @keyup.enter="onSearch"
          />
        </el-form-item>
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
        <el-form-item label="数据来源">
          <el-select
            v-model="queryForm.dataSource"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="d in dataSourceOptions"
              :key="d.value"
              :label="d.label"
              :value="d.value"
            />
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
        <el-table-column prop="code" label="编码" width="130" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="nodeName" label="所属节点" width="130" />
        <el-table-column label="目标值" width="100">
          <template #default="{ row }">{{ row.targetValue }} {{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="范围" width="120">
          <template #default="{ row }">{{ row.lowerLimit }} ~ {{ row.upperLimit }}</template>
        </el-table-column>
        <el-table-column label="数据来源" width="110">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.dataSource === 0 ? 'success' : row.dataSource === 1 ? 'warning' : 'info'"
            >
              {{
                dataSourceOptions.find(
                  (d: { label: string; value: number }) => d.value === row.dataSource,
                )?.label
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Cron" width="120" show-overflow-tooltip>
          <template #default="{ row }"
            ><code style="font-size: 12px">{{ row.cronExpression }}</code>
          </template>
        </el-table-column>
        <el-table-column label="激活" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.isActive" @change="handleToggleActive(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '编辑检测项' : '新增检测项'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100">
        <el-form-item label="检测项名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="formData.code" />
        </el-form-item>
        <el-form-item label="所属节点">
          <el-tree-select
            v-model="formData.nodeId"
            :data="nodeTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择节点"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="目标值">
          <el-input-number v-model="formData.targetValue" :precision="3" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="formData.unit" style="width: 120px" />
        </el-form-item>
        <el-form-item label="上限">
          <el-input-number v-model="formData.upperLimit" :precision="3" />
        </el-form-item>
        <el-form-item label="下限">
          <el-input-number v-model="formData.lowerLimit" :precision="3" />
        </el-form-item>
        <el-form-item label="数据来源">
          <el-select v-model="formData.dataSource" style="width: 100%">
            <el-option
              v-for="d in dataSourceOptions"
              :key="d.value"
              :label="d.label"
              :value="d.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Cron 表达式">
          <el-input v-model="formData.cronExpression" placeholder="如: 0 0 8 * * ?" />
        </el-form-item>
        <el-form-item label="计算公式">
          <el-input v-model="formData.formula" placeholder="Aviator 表达式" />
        </el-form-item>
        <el-form-item label="是否激活">
          <el-switch v-model="formData.isActive" />
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
  </div>
</template>
