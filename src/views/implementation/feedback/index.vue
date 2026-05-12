<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
const tableData = ref([
  { id: 1, planId: 1, planTitle: '优化节点A检测精度', feedback: '已更换传感器型号，精度提升至±0.01', feedbackTime: '2026-05-10 14:30', assignee: '张三' },
  { id: 2, planId: 2, planTitle: '修复B产线数据采集异常', feedback: '完成 PLC 通讯配置优化，数据采集恢复正常', feedbackTime: '2026-05-09 10:15', assignee: '李四' },
  { id: 3, planId: 3, planTitle: '建立检测项预警机制', feedback: '已完成规则配置，邮件通知已启用', feedbackTime: '2026-05-08 16:45', assignee: '王五' },
])
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">反馈记录</span>
    </div>

    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="planTitle" label="方案标题" min-width="200" />
        <el-table-column prop="assignee" label="负责人" width="100" />
        <el-table-column prop="feedback" label="反馈内容" min-width="300" />
        <el-table-column prop="feedbackTime" label="反馈时间" width="170" />
      </el-table>
    </div>
  </div>
</template>
