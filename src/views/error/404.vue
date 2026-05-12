<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面不存在</h2>
      <p class="error-desc">抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" size="large" @click="router.push('/dashboard')">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--qims-content-bg);
}

.error-content {
  text-align: center;
  padding: 40px;

  .error-code {
    font-size: 120px;
    font-weight: 800;
    color: #409eff;
    opacity: 0.15;
    line-height: 1;
    margin: 0;
  }

  .error-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 16px 0 8px;
  }

  .error-desc {
    font-size: 14px;
    color: #909399;
    margin: 0 0 32px;
  }
}
</style>
