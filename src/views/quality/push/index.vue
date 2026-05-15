<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { extractData } from '@/utils/request'
import type { InspectionItem } from '@/types/api'
import { inspectionItemApi } from '@/api/inspectionItem'

const loading = ref(false)
const tableData = ref<InspectionItem[]>([])
const total = ref(0)
const queryForm = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
})

// 编辑推送弹窗
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const formRef = ref()
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  pushCondition: '',
  pushEmails: '',
})

const formRules = {
  pushEmails: [
    {
      validator: (_rule: any, value: string, callback: (err?: Error) => void) => {
        if (!value) { callback(); return }
        const emails = value.split(',').map((e: string) => e.trim()).filter(Boolean)
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const invalid = emails.find((e: string) => !emailReg.test(e))
        if (invalid) callback(new Error(`邮箱格式不正确: ${invalid}`))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

onMounted(loadTable)

async function loadTable() {
  loading.value = true
  try {
    const res = await inspectionItemApi.page(queryForm)
    const data = extractData(res)
    tableData.value = data.records
    total.value = Number(data.total)
  } catch {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  queryForm.page = 1
  loadTable()
}

function onReset() {
  queryForm.keyword = ''
  queryForm.page = 1
  loadTable()
}

function openEdit(row: InspectionItem) {
  form.id = row.id
  form.name = row.name
  form.pushCondition = row.pushCondition || ''
  form.pushEmails = row.pushEmails || ''
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  dialogLoading.value = true
  try {
    await inspectionItemApi.update({
      id: form.id,
      name: form.name,
      pushCondition: form.pushCondition,
      pushEmails: form.pushEmails,
    } as any)
    ElMessage.success('推送配置已保存')
    dialogVisible.value = false
    loadTable()
  } catch {
    // interceptor handles
  } finally {
    dialogLoading.value = false
  }
}

function getPushStatus(row: InspectionItem): { label: string; type: string } {
  if (row.pushEmails && row.pushEmails.trim()) {
    return { label: '已配置', type: 'success' }
  }
  return { label: '未配置', type: 'info' }
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">推送管理</span>
    </div>

    <div class="page-filter">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="检测项名称/编码"
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
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="检测项名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="code" label="编码" width="130" />
        <el-table-column label="推送状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPushStatus(row).type" size="small">
              {{ getPushStatus(row).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pushCondition" label="推送条件" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <code v-if="row.pushCondition" style="font-size: 12px; color: #e6a23c">{{ row.pushCondition }}</code>
            <span v-else style="color: #c0c4cc; font-size: 13px">默认：不达标时推送</span>
          </template>
        </el-table-column>
        <el-table-column prop="pushEmails" label="推送邮箱" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.pushEmails" style="font-size: 13px">{{ row.pushEmails }}</span>
            <span v-else style="color: #c0c4cc; font-size: 13px">未配置</span>
          </template>
        </el-table-column>
        <el-table-column label="激活状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEdit(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 16px; justify-content: flex-end"
        :total="total"
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="loadTable"
      />
    </div>

    <!-- 配置推送弹窗 -->
    <el-dialog v-model="dialogVisible" title="推送配置" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="检测项">
          <el-input :model-value="form.name" disabled />
        </el-form-item>
        <el-form-item label="推送条件" prop="pushCondition">
          <el-input
            v-model="form.pushCondition"
            placeholder="Aviator 表达式，如：value > target"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px">
            留空则默认：检测结果不达标时推送
          </div>
        </el-form-item>
        <el-form-item label="推送邮箱" prop="pushEmails">
          <el-input
            v-model="form.pushEmails"
            placeholder="多个邮箱用英文逗号分隔，如: a@test.com,b@test.com"
            type="textarea"
            :rows="2"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px">
            不达标时自动发送告警邮件到以上邮箱
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-filter {
  margin-bottom: 14px;
}
</style>
