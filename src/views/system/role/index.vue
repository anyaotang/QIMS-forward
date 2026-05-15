<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { extractData } from '@/utils/request'
import { roleApi, type RoleForm, type RoleQuery } from '@/api/role'
import { permissionApi } from '@/api/permission'
import type { RoleInfo, MenuDTO } from '@/types/api'
import { useI18n } from 'vue-i18n'
import {
  Plus,
  Edit,
  Delete,
  Search,
  Refresh,
  Setting,
  WarningFilled,
} from '@element-plus/icons-vue'

const { t } = useI18n()

// ============ 状态 ============
const loading = ref(false)
const tableData = ref<RoleInfo[]>([])
const total = ref(0)

// 查询参数
const queryParams: RoleQuery = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
})

// 新增/编辑弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const formData = reactive<RoleForm>({
  id: undefined,
  name: '',
  code: '',
  status: 1,
  dataScope: 1,
  remark: '',
})

const rules = computed(() => ({
  name: [{ required: true, message: t('role.namePlaceholder'), trigger: 'blur' }],
  code: [
    { required: true, message: t('role.codePlaceholder'), trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/, message: t('role.codeRuleHint'), trigger: 'blur' },
  ],
  status: [{ required: true, message: t('role.status'), trigger: 'change' }],
}))

// 权限配置弹窗
const permDialogVisible = ref(false)
const permDialogTitle = ref('')
const permTreeRef = ref()
const permTreeData = ref<MenuDTO[]>([])
const permCheckedKeys = ref<number[]>([])
const permLoading = ref(false)
const currentPermRoleId = ref<number>(null!)

// 数据范围选项
const dataScopeOptions = computed(() => [
  { label: t('role.dataScopeAll'), value: 1 },
  { label: t('role.dataScopeDept'), value: 2 },
  { label: t('role.dataScopeDeptAndSub'), value: 3 },
  { label: t('role.dataScopeSelf'), value: 4 },
])

// ============ 生命周期 ============
onMounted(() => {
  loadData()
})

// ============ 数据加载 ============
async function loadData() {
  loading.value = true
  try {
    const res = await roleApi.page(queryParams)
    const data = extractData(res)
    tableData.value = data.records
    total.value = Number(data.total)
  } catch (e) {
    console.error('[Role] 加载角色列表失败:', e)
    ElMessage.error(t('common.error'))
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ============ 搜索 ============
function onSearch() {
  queryParams.page = 1
  loadData()
}

function onReset() {
  queryParams.keyword = ''
  queryParams.page = 1
  loadData()
}

// ============ 分页 ============
function onSizeChange(size: number) {
  queryParams.pageSize = size
  queryParams.page = 1
  loadData()
}

function onCurrentChange(page: number) {
  queryParams.page = page
  loadData()
}

// ============ 新增 ============
function openAdd() {
  dialogTitle.value = t('role.addRole')
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    status: 1,
    dataScope: 1,
    remark: '',
  })
  dialogVisible.value = true
}

// ============ 编辑 ============
function openEdit(row: RoleInfo) {
  dialogTitle.value = t('role.editRole')
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    status: row.status,
    dataScope: row.dataScope ?? 1,
    remark: row.remark ?? '',
  })
  dialogVisible.value = true
}

// ============ 保存 ============
async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    if (formData.id) {
      await roleApi.update(formData)
      ElMessage.success(t('common.success'))
    } else {
      await roleApi.create(formData)
      ElMessage.success(t('common.success'))
    }
    dialogVisible.value = false
    loadData()
  } catch {
    // interceptor handles error
  }
}

// ============ 删除 ============
async function handleDelete(row: RoleInfo) {
  await ElMessageBox.confirm(
    t('role.deleteConfirm', { name: row.name }),
    t('common.confirmDelete'),
    {
      type: 'warning',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
    },
  )
  try {
    await roleApi.delete(row.id)
    ElMessage.success(t('common.success'))
    loadData()
  } catch {
    // interceptor handles error / user cancelled
  }
}

// ============ 权限配置 ============
async function openPermissionConfig(row: RoleInfo) {
  currentPermRoleId.value = row.id
  permDialogTitle.value = t('role.assignPermissionTitle', { name: row.name })
  permDialogVisible.value = true
  permLoading.value = true

  try {
    // 并行加载权限树和已选权限
    const [treeRes, permRes] = await Promise.all([
      permissionApi.tree(),
      roleApi.getPermissions(row.id),
    ])
    permTreeData.value = extractData(treeRes) || []
    permCheckedKeys.value = extractData(permRes) || []
  } catch (e) {
    console.error('[Role] 加载权限树失败:', e)
    ElMessage.error(t('common.error'))
    permTreeData.value = []
    permCheckedKeys.value = []
  } finally {
    permLoading.value = false
  }
}

// 保存权限分配
async function handleSavePermissions() {
  const checkedKeys = permTreeRef.value.getCheckedKeys(false) as number[]
  const halfCheckedKeys = permTreeRef.value.getHalfCheckedKeys() as number[]
  const allChecked = [...checkedKeys, ...halfCheckedKeys]

  try {
    await roleApi.assignPermissions(currentPermRoleId.value, allChecked)
    ElMessage.success(t('role.assignSuccess'))
    permDialogVisible.value = false
  } catch {
    // interceptor handles error
  }
}

// ============ 状态切换 ============
async function toggleStatus(row: RoleInfo) {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? t('role.enable') : t('role.disable')

  await ElMessageBox.confirm(
    t('role.toggleConfirm', { action: actionText, name: row.name }),
    t('common.warning'),
    {
      type: 'warning',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
    },
  )

  try {
    await roleApi.update({ ...row, status: newStatus })
    ElMessage.success(`${actionText}${t('common.success')}`)
    loadData()
  } catch {
    // interceptor handles error / user cancelled
  }
}

// ============ 辅助方法 ============
function getStatusTagType(status: number) {
  return status === 1 ? 'success' : 'danger'
}

function getStatusLabel(status: number) {
  return status === 1 ? '启用' : '禁用'
}

function getDataScopeLabel(scope: number) {
  const opt = dataScopeOptions.value.find((o) => o.value === scope)
  return opt?.label ?? '-'
}
</script>

<template>
  <div class="page-container">
    <!-- 页头 -->
    <div class="page-header">
      <span class="page-title">{{ t('role.title') }}</span>
      <el-button type="primary" :icon="Plus" @click="openAdd">{{ t('role.addRole') }}</el-button>
    </div>

    <!-- 搜索 -->
    <div class="page-filter">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            :placeholder="t('role.keywordPlaceholder')"
            clearable
            style="width: 240px"
            @keyup.enter="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">{{
            t('common.search')
          }}</el-button>
          <el-button :icon="Refresh" @click="onReset">{{ t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="code" :label="t('role.code')" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="font-family: monospace; font-size: 13px; color: #409eff">
              {{ row.code }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="name"
          :label="t('role.name')"
          min-width="140"
          show-overflow-tooltip
        />

        <el-table-column
          prop="remark"
          :label="t('role.description')"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="t('role.status')" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :active-text="t('role.enabled')"
              :inactive-text="t('role.disabled')"
              inline-prompt
              @change="toggleStatus(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="dataScope" :label="t('role.dataScope')" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ getDataScopeLabel(row.dataScope) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" :label="t('role.createTime')" width="170" />

        <el-table-column :label="t('common.operator')" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="Edit" @click="openEdit(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              :icon="Setting"
              @click="openPermissionConfig(row)"
            >
              {{ t('role.assignPermission') }}
            </el-button>
            <el-button type="danger" link size="small" :icon="Delete" @click="handleDelete(row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      destroy-on-close
      @close="formRef?.resetFields()"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item :label="t('role.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="t('role.namePlaceholder')" />
        </el-form-item>

        <el-form-item :label="t('role.code')" prop="code">
          <el-input v-model="formData.code" :placeholder="t('role.codePlaceholder')">
            <template #append>
              <el-tooltip :content="t('role.codeRuleHint')" placement="top">
                <el-icon><WarningFilled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="t('role.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ t('role.enabled') }}</el-radio>
            <el-radio :value="0">{{ t('role.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="t('role.dataScope')">
          <el-select
            v-model="formData.dataScope"
            :placeholder="t('role.dataScope')"
            style="width: 100%"
          >
            <el-option
              v-for="opt in dataScopeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('common.remark')">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            :placeholder="t('common.remark')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置弹窗 -->
    <el-dialog v-model="permDialogVisible" :title="permDialogTitle" width="560px" destroy-on-close>
      <div v-loading="permLoading" style="min-height: 300px">
        <el-tree
          ref="permTreeRef"
          :data="permTreeData"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          show-checkbox
          default-expand-all
          check-strictly
          :default-checked-keys="permCheckedKeys"
          highlight-current
          style="border: 1px solid #ebeef5; border-radius: 6px; padding: 12px"
        >
          <template #default="{ data }">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-tag :type="data.type === 1 ? undefined : 'info'" size="small" effect="plain">
                {{ data.type === 1 ? '菜单' : '按钮' }}
              </el-tag>
              <span>{{ data.name }}</span>
              <span
                v-if="data.code"
                style="color: #909399; font-size: 12px; font-family: monospace"
              >
                ({{ data.code }})
              </span>
            </div>
          </template>
        </el-tree>
      </div>

      <template #footer>
        <el-button @click="permDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSavePermissions">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
