<script setup lang="ts">
import {ElMessage, ElMessageBox} from 'element-plus'
import {extractData} from '@/utils/request'
import type {NodeTreeNode, NodeForm} from '@/types/api'
import {nodeApi} from "@/api/node";

const loading = ref(false)
const treeData = ref<NodeTreeNode[]>([])
const dialogVisible = ref(false)
const formRef = ref()
const formData = reactive<NodeForm>({
  name: '',
  code: '',
  parentId: null,
  type: 0,
  orderNum: 0,
  description: ''
})
const rules = {name: [{required: true, message: '请输入节点名称', trigger: 'blur'}]}
const typeOptions = [
  {label: '根节点', value: 0},
  {label: '区域', value: 1},
  {label: '产线', value: 2},
  {label: '工位', value: 3},
]

onMounted(loadTree)

async function loadTree() {
  loading.value = true
  try {
    const res = await nodeApi.tree()
    treeData.value = extractData(res)
  } finally {
    loading.value = false
  }
}

function openAdd(parentId?: number, type = 0) {
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    parentId: parentId ?? null,
    type,
    orderNum: 0,
    description: ''
  })
  dialogVisible.value = true
}

function openEdit(row: NodeTreeNode) {
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code || '',
    parentId: row.parentId ?? null,
    type: row.type ?? 0,
    orderNum: row.orderNum ?? 0,
    description: row.description || ''
  })
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (formData.id) {
      await nodeApi.update(formData)
    } else {
      await nodeApi.create(formData)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadTree()
  } catch { /* interceptor */
  }
}

async function handleDelete(row: NodeTreeNode) {
  await ElMessageBox.confirm('确定删除该节点？', '提示', {type: 'warning'})
  await nodeApi.delete(row.id)
  ElMessage.success('删除成功')
  loadTree()
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">节点管理</span>
      <el-button type="primary" @click="openAdd()">新增节点</el-button>
    </div>

    <div class="page-table">
      <el-tree
        :data="treeData"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        v-loading="loading"
        default-expand-all
        :expand-on-click-node="false"
        draggable
      >
        <template #default="{ data }">
          <div class="tree-node">
            <div class="node-info">
              <el-tag size="small" type="info" style="margin-right:8px">
                {{
                  typeOptions.find((t: {
                    label: string;
                    value: number
                  }) => t.value === data.type)?.label || '节点'
                }}
              </el-tag>
              <span class="node-name">{{ data.name }}</span>
              <span v-if="data.code" class="node-code">{{ data.code }}</span>
            </div>
            <div class="node-actions">
              <el-button type="primary" link size="small"
                         @click.stop="openAdd(data.id, (data.type ?? 0) + 1)">新增子节点
              </el-button>
              <el-button type="primary" link size="small" @click.stop="openEdit(data)">编辑
              </el-button>
              <el-button type="danger" link size="small" @click.stop="handleDelete(data)">删除
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
      <div class="drag-tip">💡 拖拽节点可调整归属</div>
    </div>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑节点' : '新增节点'" width="520px"
               destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="90">
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="formData.name"/>
        </el-form-item>
        <el-form-item label="节点编码">
          <el-input v-model="formData.code"/>
        </el-form-item>
        <el-form-item label="节点类型">
          <el-select v-model="formData.type" style="width:100%">
            <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label"
                       :value="opt.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="上级节点">
          <el-tree-select v-model="formData.parentId" :data="treeData"
                          :props="{ label: 'name', value: 'id', children: 'children' }"
                          placeholder="顶级节点" clearable check-strictly style="width:100%"/>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.orderNum" :min="0"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3"/>
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
  padding: 4px 8px;

  .node-info {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .node-name {
    font-size: 14px;
  }

  .node-code {
    font-size: 12px;
    color: #909399;
    margin-left: 4px;
  }

  .node-actions {
    display: none;
  }

  &:hover .node-actions {
    display: flex;
    gap: 4px;
  }
}

.drag-tip {
  padding: 10px 12px;
  font-size: 12px;
  color: #909399;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.page-table {
  padding: 0;
}
</style>
