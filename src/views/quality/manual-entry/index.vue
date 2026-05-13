<script setup lang="ts">
import {ElMessage} from 'element-plus'
import {extractData} from '@/utils/request'
import type {NodeTreeNode, InspectionItem, ManualRecordForm} from '@/types/api'
import {inspectionItemApi} from "@/api/inspectionItem";
import {recordApi} from "@/api/record";
import {nodeApi} from "@/api/node";

const loading = ref(false)
const submitting = ref(false)
const nodeTree = ref<NodeTreeNode[]>([])
const itemList = ref<InspectionItem[]>([])
const formRef = ref()
const formData = reactive<ManualRecordForm>({
  itemId: 0, nodeId: undefined, value: 0, recordTime: '', inspector: '', remark: '',
})

const rules = {
  itemId: [{required: true, message: '请选择检测项', trigger: 'change'}],
  value: [{required: true, message: '请输入检测值', trigger: 'blur'}],
  recordTime: [{required: true, message: '请选择录入时间', trigger: 'change'}],
}

onMounted(async () => {
  try {
    const res = await nodeApi.tree();
    nodeTree.value = extractData(res)
  } catch {
  }
  formData.recordTime = new Date().toISOString().slice(0, 16).replace('T', ' ')
})

async function handleNodeChange(nodeId: number | undefined) {
  formData.nodeId = nodeId
  formData.itemId = 0
  itemList.value = []
  if (nodeId) {
    try {
      const res = await inspectionItemApi.page({page: 1, pageSize: 200, nodeId})
      const data = extractData(res)
      itemList.value = data.list.filter((i: InspectionItem) => i.dataSource === 2)
    } catch {
    }
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await recordApi.manual(formData)
    ElMessage.success('录入成功')
    formRef.value.resetFields()
    formData.recordTime = new Date().toISOString().slice(0, 16).replace('T', ' ')
    itemList.value = []
  } catch { /* interceptor */
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">人工录入</span>
    </div>

    <div class="page-table" style="max-width: 640px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120" class="entry-form">
        <el-form-item label="选择节点" prop="nodeId">
          <el-tree-select v-model="formData.nodeId" :data="nodeTree"
                          :props="{ label: 'name', value: 'id', children: 'children' }"
                          placeholder="选择节点" clearable check-strictly style="width:100%"
                          @change="handleNodeChange"/>
        </el-form-item>

        <el-form-item label="选择检测项" prop="itemId">
          <el-select v-model="formData.itemId" placeholder="请先选节点" style="width:100%"
                     :disabled="!formData.nodeId">
            <el-option v-for="item in itemList" :key="item.id"
                       :label="`${item.name} (目标值: ${item.targetValue} ${item.unit})`"
                       :value="item.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="检测值" prop="value">
          <el-input-number v-model="formData.value" :precision="3" :step="0.1" style="width:100%"/>
        </el-form-item>

        <el-form-item label="录入时间" prop="recordTime">
          <el-date-picker v-model="formData.recordTime" type="datetime"
                          value-format="YYYY-MM-DD HH:mm:ss"
                          placeholder="选择日期时间" style="width:100%"/>
        </el-form-item>

        <el-form-item label="录入人" prop="inspector">
          <el-input v-model="formData.inspector" placeholder="请输入录入人姓名"/>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="可选"/>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" size="large" style="width:200px"
                     @click="handleSubmit">
            提交录入
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.entry-form {
  padding: 24px 8px;
}
</style>
