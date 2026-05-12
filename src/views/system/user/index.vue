<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi, departmentApi, extractData } from '@/utils/request'
import type { UserInfo, DepartmentTreeNode, UserForm } from '@/types/api'

const loading = ref(false)
const tableData = ref<UserInfo[]>([])
const total = ref(0)
const queryForm = reactive({ page: 1, pageSize: 10, keyword: '', status: undefined as number | undefined })
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const deptTree = ref<DepartmentTreeNode[]>([])
const formData = reactive<UserForm>({
  userId: undefined, username: '', nickname: '', email: '', phone: '',
  departmentId: undefined, roleIds: [], password: '', status: 1,
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
}

onMounted(() => {
  loadTable()
  loadDeptTree()
})

async function loadTable() {
  loading.value = true
  try {
    const res = await userApi.list(queryForm)
    const data = extractData(res)
    tableData.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function loadDeptTree() {
  try {
    const res = await departmentApi.tree()
    deptTree.value = extractData(res)
  } catch { /* ignore */ }
}

function onSearch() { queryForm.page = 1; loadTable() }
function onReset() { Object.assign(queryForm, { page: 1, pageSize: 10, keyword: '', status: undefined }); loadTable() }

function openAdd() {
  dialogTitle.value = '新增用户'
  Object.assign(formData, { userId: undefined, username: '', nickname: '', email: '', phone: '', departmentId: undefined, roleIds: [], password: '', status: 1 })
  dialogVisible.value = true
}

function openEdit(row: UserInfo) {
  dialogTitle.value = '编辑用户'
  Object.assign(formData, { userId: row.userId, username: row.username, nickname: row.nickname, email: row.email, phone: row.phone, departmentId: row.departmentId, roleIds: [], password: '', status: row.status })
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (formData.userId) {
      await userApi.update(formData)
    } else {
      await userApi.create(formData)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadTable()
  } catch { /* interceptor */ }
}

async function handleDelete(row: UserInfo) {
  await ElMessageBox.confirm('确定删除该用户？', '提示', { type: 'warning' })
  await userApi.delete(row.userId)
  ElMessage.success('删除成功')
  loadTable()
}

async function handleResetPwd(row: UserInfo) {
  await ElMessageBox.confirm('确定重置该用户密码？', '提示', { type: 'warning' })
  await userApi.resetPassword(row.userId)
  ElMessage.success('密码已重置为 123456')
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">用户管理</span>
      <el-button type="primary" @click="openAdd">新增用户</el-button>
    </div>

    <div class="page-filter">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="用户名/昵称" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable style="width:120px">
            <el-option label="正常" :value="1" />
            <el-option label="冻结" :value="0" />
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
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="departmentName" label="部门" width="130" />
        <el-table-column prop="roles" label="角色" min-width="140">
          <template #default="{ row }">
            <el-tag v-for="r in row.roles" :key="r" size="small" type="info" style="margin-right:4px">{{ r }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '冻结' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="warning" link size="small" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="!!formData.userId" />
        </el-form-item>
        <el-form-item v-if="!formData.userId" label="密码">
          <el-input v-model="formData.password" type="password" show-password placeholder="留空则不修改" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="部门">
          <el-tree-select v-model="formData.departmentId" :data="deptTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择部门" clearable check-strictly style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
