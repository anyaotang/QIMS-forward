<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const tableData = ref([
  { id: 1, name: 'admin', displayName: '超级管理员', description: '系统最高权限', userCount: 1, createTime: '2026-05-01' },
  { id: 2, name: 'manager', displayName: '质量管理经理', description: '质量管理相关权限', userCount: 3, createTime: '2026-05-01' },
  { id: 3, name: 'inspector', displayName: '质检员', description: '检测记录录入和查看', userCount: 8, createTime: '2026-05-01' },
  { id: 4, name: 'viewer', displayName: '访客', description: '仅查看数据', userCount: 5, createTime: '2026-05-01' },
])
const loading = ref(false)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">角色管理</span>
      <el-button type="primary">新增角色</el-button>
    </div>

    <div class="page-filter">
      <el-form :inline="true">
        <el-form-item label="关键词"><el-input placeholder="角色名称" clearable /></el-form-item>
        <el-form-item><el-button type="primary">搜索</el-button><el-button>重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="page-table">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="角色标识" width="160" />
        <el-table-column prop="displayName" label="角色名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="userCount" label="用户数" width="90" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">编辑</el-button>
            <el-button type="primary" link size="small">权限配置</el-button>
            <el-button type="danger" link size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
