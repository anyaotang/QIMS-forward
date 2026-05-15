<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { extractData } from '@/utils/request'
import { permissionApi, type MenuForm } from '@/api/permission'
import type { MenuDTO } from '@/types/api'
import {
  Plus,
  Edit,
  Delete,
  Search,
  Refresh,
  WarningFilled,
  Menu as MenuIcon,
  Grid,
} from '@element-plus/icons-vue'

// ============ 状态 ============
const loading = ref(false)
const treeData = ref<MenuDTO[]>([])
const expandedKeys = ref<number[]>([])
const filterText = ref('')

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const formData = reactive<MenuForm>({
  id: undefined,
  name: '',
  code: '',
  type: 1,
  parentId: null,
  sort: 0,
  path: '',
  icon: '',
  permission: '',
  status: 1,
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

// 权限类型选项
const typeOptions = [
  { label: '菜单', value: 1 },
  { label: '按钮', value: 2 },
]

// 图标选项
const iconOptions = [
  'Setting',
  'User',
  'OfficeBuilding',
  'Key',
  'Connection',
  'DocumentChecked',
  'List',
  'Edit',
  'TrendCharts',
  'Tickets',
  'ChatDotRound',
  'DataAnalysis',
  'DataLine',
  'Memo',
  'Odometer',
  'Grid',
  'Monitor',
  'Document',
  'Collection',
]

// ============ 树形表格 ref ============
const treeTableRef = ref()

// ============ 生命周期 ============
onMounted(() => {
  loadTree()
})

// ============ 方法 ============
async function loadTree() {
  loading.value = true
  try {
    const res = await permissionApi.tree()
    const data = extractData(res)
    treeData.value = data || []
    // 默认展开第一层
    expandedKeys.value = data?.map((d: MenuDTO) => d.id) || []
  } catch (e) {
    console.error('[Permission] 加载权限树失败:', e)
    ElMessage.error('加载权限数据失败')
    treeData.value = []
  } finally {
    loading.value = false
  }
}

function onSearch() {
  // 树形表格前端过滤
  treeTableRef.value?.filter(filterText.value)
}

function onReset() {
  filterText.value = ''
  treeTableRef.value?.filter('')
}

// 树形表格过滤方法
function filterNode(value: string, data: MenuDTO) {
  if (!value) return true
  const keyword = value.toLowerCase()
  return (
    data.name?.toLowerCase().includes(keyword) ||
    data.code?.toLowerCase().includes(keyword) ||
    data.path?.toLowerCase().includes(keyword)
  )
}

// 新增顶级菜单
function openAdd() {
  dialogTitle.value = '新增权限'
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    type: 1,
    parentId: null,
    sort: 0,
    path: '',
    icon: '',
    permission: '',
    status: 1,
  })
  dialogVisible.value = true
}

// 新增子菜单
function openAddChild(row: MenuDTO) {
  dialogTitle.value = '新增子权限'
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    type: row.type === 1 ? 2 : 2, // 菜单下默认添加按钮
    parentId: row.id,
    sort: 0,
    path: '',
    icon: '',
    permission: '',
    status: 1,
  })
  dialogVisible.value = true
}

// 编辑
function openEdit(row: MenuDTO) {
  dialogTitle.value = '编辑权限'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    parentId: row.parentId ?? null,
    sort: row.sort ?? 0,
    path: row.path ?? '',
    icon: row.icon ?? '',
    permission: (row as any).permission ?? '',
    status: (row as any).status ?? 1,
  })
  dialogVisible.value = true
}

// 保存
async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    if (formData.id) {
      await permissionApi.update(formData)
    } else {
      await permissionApi.create(formData)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadTree()
  } catch {
    // interceptor handles error
  }
}

// 删除
async function handleDelete(row: MenuDTO) {
  const hasChildren = row.children && row.children.length > 0
  const msg = hasChildren
    ? '该权限下存在子权限，删除后子权限将一并删除，确定继续？'
    : '确定删除该权限？'

  await ElMessageBox.confirm(msg, '提示', { type: 'warning' })
  try {
    await permissionApi.delete(row.id)
    ElMessage.success('删除成功')
    loadTree()
  } catch {
    // interceptor handles error
  }
}

// 获取类型标签样式
function getTypeTagType(type: number) {
  return type === 1 ? 'primary' : 'info'
}

function getTypeLabel(type: number) {
  return type === 1 ? '菜单' : '按钮'
}

// 获取状态标签样式
function getStatusTagType(status: number) {
  return status === 1 ? 'success' : 'danger'
}

function getStatusLabel(status: number) {
  return status === 1 ? '启用' : '禁用'
}
</script>

<template>
  <div class="page-container">
    <!-- 页头 -->
    <div class="page-header">
      <span class="page-title">权限管理</span>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增权限</el-button>
    </div>

    <!-- 搜索 -->
    <div class="page-filter">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="filterText"
            placeholder="名称/编码/路径"
            clearable
            style="width: 220px"
            @keyup.enter="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 树形表格 -->
    <div class="page-table">
      <el-table
        ref="treeTableRef"
        :data="treeData"
        v-loading="loading"
        row-key="id"
        :default-expand-all="false"
        :expand-row-keys="expandedKeys"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="权限名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 6px">
              <el-icon v-if="row.type === 1" size="16" color="#409eff">
                <MenuIcon />
              </el-icon>
              <el-icon v-else size="14" color="#909399">
                <Grid />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="code" label="权限编码" min-width="150" show-overflow-tooltip />

        <el-table-column prop="path" label="路由路径" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.path" style="font-family: monospace; font-size: 13px; color: #409eff">
              {{ row.path }}
            </span>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.icon" size="small" type="info">{{ row.icon }}</el-tag>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="sort" label="排序" width="70" align="center" />

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType((row as any).status ?? 1)" size="small">
              {{ getStatusLabel((row as any).status ?? 1) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openAddChild(row)">
              新增子项
            </el-button>
            <el-button type="primary" link size="small" @click="openEdit(row)"> 编辑 </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      destroy-on-close
      @close="formRef?.resetFields()"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="上级权限">
          <el-tree-select
            v-model="formData.parentId"
            :data="treeData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="顶级权限"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="如：用户管理、用户新增" />
        </el-form-item>

        <el-form-item label="权限编码" prop="code">
          <el-input v-model="formData.code" placeholder="如：user:manage、user:create">
            <template #append>
              <el-tooltip content="编码格式建议：模块:操作，如 user:manage" placement="top">
                <el-icon><WarningFilled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>

        <!-- 菜单类型特有字段 -->
        <template v-if="formData.type === 1">
          <el-form-item label="路由路径">
            <el-input v-model="formData.path" placeholder="如：/system/user" />
          </el-form-item>

          <el-form-item label="图标">
            <el-select
              v-model="formData.icon"
              placeholder="选择图标"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 按钮类型特有字段 -->
        <template v-if="formData.type === 2">
          <el-form-item label="权限标识">
            <el-input v-model="formData.permission" placeholder="如：user:create、user:delete" />
          </el-form-item>
        </template>

        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
