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
.profile-card {
  background: var(--qims-card-bg);
  border-radius: 8px;
  padding: 32px;
  max-width: 800px;
}

.profile-avatar {
  text-align: center;
  margin-bottom: 28px;

  .nickname {
    font-size: 22px;
    font-weight: 600;
    margin: 12px 0 4px;
  }

  .username {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}
</style>
