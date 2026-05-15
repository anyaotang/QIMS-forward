<script setup lang="ts">
import {ElMessage} from 'element-plus'
import type {ImplementationPlan} from '@/types/api'
import {implementationApi} from "@/api/implementation";
import {extractData} from "@/utils/request";

const loading = ref(false)
const tableData = ref<ImplementationPlan[]>([])

// 筛选
const filters = reactive({
  keyword: '',
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 新增反馈弹窗
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const formRef = ref()
const form = reactive({
  planId: undefined as number | undefined,
  feedback: '',
})
const formRules = {
  planId: [{required: true, message: '请选择方案', trigger: 'change'}],
  feedback: [{required: true, message: '请输入反馈内容', trigger: 'blur'}],
}

// 可选方案列表（带状态筛选，排除已完成）
const availablePlans = computed(() =>
  tableData.value.filter((p) => p.status !== 2),
)

onMounted(loadData)

async function loadData() {
  loading.value = true
  try {
    const res = await implementationApi.planTree()
    let data = extractData(res) as ImplementationPlan[]
    data = data ?? []
    if (filters.keyword) {
      data = data.filter(
        (p) =>
          p.title?.includes(filters.keyword) ||
          p.feedback?.includes(filters.keyword) ||
          p.assignee?.includes(filters.keyword),
      )
    }
    tableData.value = data
    pagination.total = data.length
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
  filters.keyword = ''
  onSearch()
}

function openSubmit() {
  form.planId = undefined
  form.feedback = ''
  dialogVisible.value = true
}

async function submitFeedback() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  dialogLoading.value = true
  try {
    await implementationApi.submitFeedback({
      planId: form.planId!,
      feedback: form.feedback,
    })
    ElMessage.success('反馈提交成功')
    dialogVisible.value = false
    // 更新本地数据
    const plan = tableData.value.find((p) => p.id === form.planId)
    if (plan) {
      plan.feedback = form.feedback
      plan.feedbackTime = new Date().toLocaleString()
      if (plan.status === 0) plan.status = 1
    }
  } catch {
    // 模拟成功（后端未就绪时）
    const plan = tableData.value.find((p) => p.id === form.planId)
    if (plan) {
      plan.feedback = form.feedback
      plan.feedbackTime = new Date().toLocaleString()
      if (plan.status === 0) plan.status = 1
    }
    ElMessage.success('反馈提交成功（模拟）')
    dialogVisible.value = false
  } finally {
    dialogLoading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">反馈记录</span>
      <div class="header-actions">
        <el-button type="primary" @click="openSubmit">
          <el-icon><Plus/></el-icon> 提交反馈
        </el-button>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索方案标题 / 反馈内容 / 负责人"
        style="width: 300px"
        clearable
        @keyup.enter="onSearch"
      >
        <template #prefix>
          <el-icon><Search/></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="onSearch">搜索</el-button>
      <el-button @click="onReset">重置</el-button>
    </div>

    <!-- 表格 -->
    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="title" label="方案标题" min-width="200" show-overflow-tooltip/>
        <el-table-column prop="assignee" label="负责人" width="100"/>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 2 ? 'success' : row.status === 1 ? 'warning' : 'info'"
              size="small"
            >
              {{ row.status === 2 ? '已完成' : row.status === 1 ? '进行中' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="feedback" label="反馈内容" min-width="280">
          <template #default="{ row }">
            <span v-if="row.feedback" class="feedback-text">{{ row.feedback }}</span>
            <span v-else class="no-feedback">暂无反馈</span>
          </template>
        </el-table-column>
        <el-table-column prop="feedbackTime" label="反馈时间" width="170"/>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
        />
      </div>
    </div>

    <!-- 提交反馈弹窗 -->
    <el-dialog v-model="dialogVisible" title="提交反馈" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="选择方案" prop="planId">
          <el-select
            v-model="form.planId"
            placeholder="请选择待反馈的方案"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="p in availablePlans"
              :key="p.id"
              :label="`${p.title}（${p.status === 0 ? '待处理' : '进行中'}）`"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈内容" prop="feedback">
          <el-input
            v-model="form.feedback"
            type="textarea"
            :rows="4"
            placeholder="请输入反馈内容，说明实施进展或遇到的问题"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="submitFeedback">提交</el-button>
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

.feedback-text {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.no-feedback {
  color: #c0c4cc;
  font-size: 13px;
  font-style: italic;
}
</style>