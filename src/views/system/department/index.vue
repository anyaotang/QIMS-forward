<script setup lang="ts">
import {ElMessage, ElMessageBox} from 'element-plus'
import {extractData} from '@/utils/request'
import type {DepartmentTreeNode} from '@/types/api'
import {departmentApi} from "@/api/department";

const loading = ref(false)
const treeData = ref<DepartmentTreeNode[]>([])
const dialogVisible = ref(false)
const formData = ref<{
  id?: number;
  name: string;
  parentId: number | null;
  orderNum: number;
  leader: string;
  phone: string
}>(
  {name: '', parentId: null, orderNum: 0, leader: '', phone: ''}
)
const formRef = ref()
const rules = {name: [{required: true, message: '请输入部门名称', trigger: 'blur'}]}

onMounted(loadTree)

async function loadTree() {
  loading.value = true
  try {
    const res = await departmentApi.tree()
    treeData.value = extractData(res)
  } finally {
    loading.value = false
  }
}

function openAdd(parentId?: number) {
  formData.value = {
    id: undefined,
    name: '',
    parentId: parentId ?? null,
    orderNum: 0,
    leader: '',
    phone: ''
  }
  dialogVisible.value = true
}

function openEdit(row: DepartmentTreeNode) {
  formData.value = {
    id: row.id,
    name: row.name,
    parentId: row.parentId ?? null,
    orderNum: row.orderNum ?? 0,
    leader: (row as any).leader || '',
    phone: (row as any).phone || ''
  }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (formData.value.id) {
      await departmentApi.update(formData.value as any)
    } else {
      await departmentApi.create(formData.value as any)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadTree()
  } catch { /* interceptor */
  }
}

async function handleDelete(row: DepartmentTreeNode) {
  await ElMessageBox.confirm('确定删除该部门？', '提示', {type: 'warning'})
  await departmentApi.delete(row.id)
  ElMessage.success('删除成功')
  loadTree()
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">部门管理</span>
      <el-button type="primary" @click="openAdd()">新增部门</el-button>
    </div>

    <div class="page-table">
      <el-tree
        :data="treeData"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        v-loading="loading"
        default-expand-all
        :expand-on-click-node="false"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <span class="node-label">{{ data.name }}</span>
            <span class="node-actions">
              <el-button type="primary" link size="small"
                         @click.stop="openAdd(data.id)">新增子部门</el-button>
              <el-button type="primary" link size="small"
                         @click.stop="openEdit(data)">编辑</el-button>
              <el-button type="danger" link size="small"
                         @click.stop="handleDelete(data)">删除</el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </div>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑部门' : '新增部门'" width="480px"
               destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="90">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formData.name"/>
        </el-form-item>
        <el-form-item label="上级部门">
          <el-tree-select v-model="formData.parentId" :data="treeData"
                          :props="{ label: 'name', value: 'id', children: 'children' }"
                          placeholder="顶级部门" clearable check-strictly style="width:100%"/>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.orderNum" :min="0"/>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="formData.leader"/>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.phone"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;

  .node-label {
    font-size: 14px;
  }

  .node-actions {
    display: none;
  }

  &:hover .node-actions {
    display: flex;
    gap: 4px;
  }
}

.page-table {
  padding: 0;
}
</style>
