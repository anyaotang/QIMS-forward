<script setup lang="ts">
import {useUserStore} from '@/stores/user'

const userStore = useUserStore()
const user = computed(() => userStore.userInfo)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">个人中心</span>
    </div>

    <div class="profile-card">
      <div class="profile-avatar">
        <el-avatar :size="80" :src="userStore.avatar">
          {{ userStore.nickname?.charAt(0)?.toUpperCase() }}
        </el-avatar>
        <h2 class="nickname">{{ userStore.nickname }}</h2>
        <p class="username">@{{ userStore.username }}</p>
      </div>

      <el-descriptions :column="2" border class="profile-info">
        <el-descriptions-item label="用户名">{{ user?.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user?.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user?.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user?.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ user?.departmentName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag v-for="r in user?.roles" :key="r" size="small" style="margin-right:4px">{{
              r
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="权限" :span="2">
          <el-tag v-for="p in user?.permissions?.slice(0, 20)" :key="p" size="small" type="info"
                  style="margin-right:4px;margin-bottom:2px">{{ p }}
          </el-tag>
          <span v-if="(user?.permissions?.length || 0) > 20"
                style="color:#909399">...共 {{ user?.permissions?.length }} 项</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.profile-card {
  background: var(--qims-card-bg);
  border-radius: 16px;
  padding: 40px;
  max-width: 900px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;

  // 装饰性背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-color-primary-light-9) 100%);
    z-index: 0;
  }
}

.profile-avatar {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 32px;
  padding-top: 20px;

  :deep(.el-avatar) {
    border: 4px solid #fff;
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.25);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 32px rgba(64, 158, 255, 0.35);
    }
  }

  .nickname {
    font-size: 26px;
    font-weight: 700;
    margin: 16px 0 6px;
    color: var(--el-text-color-primary);
    letter-spacing: 1px;
  }

  .username {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0;
    font-family: 'Monaco', 'Menlo', monospace;
    background: var(--el-fill-color-light);
    padding: 4px 12px;
    border-radius: 12px;
    display: inline-block;
  }
}

.profile-info {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  :deep(.el-descriptions__label) {
    font-weight: 600;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-light);
    padding: 12px 16px;
    min-width: 100px;
  }

  :deep(.el-descriptions__content) {
    padding: 12px 16px;
    color: var(--el-text-color-primary);
  }

  :deep(.el-tag) {
    margin: 3px;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  // 角色标签样式
  :deep(.el-tag--small) {
    &:first-child {
      background: linear-gradient(135deg, var(--el-color-primary-light-7), var(--el-color-primary-light-8));
      color: var(--el-color-primary);
      border: none;
    }
  }

  // 权限标签样式
  .permission-tag {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    border: 1px solid var(--el-border-color-lighter);
    font-size: 12px;
  }
}
</style>
