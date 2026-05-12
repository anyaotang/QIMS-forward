<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore, LOCALE_OPTIONS } from '@/stores/locale'
import { useI18n } from 'vue-i18n'
import {
  Sunny,
  Moon,
  Expand,
  Fold,
  Bell,
  User,
  SwitchButton,
} from '@element-plus/icons-vue'

const emit = defineEmits<{ toggleSidebar: [] }>()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const { t, locale } = useI18n()

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await userStore.logout()
  router.push('/login')
}

function handleLocaleChange(val: string) {
  locale.value = val as 'zh-CN' | 'en-US'
  localeStore.setLocale(val as 'zh-CN' | 'en-US')
}
</script>

<template>
  <header class="header-bar">
    <!-- 左侧：折叠按钮 -->
    <div class="header-left">
      <el-button text @click="emit('toggleSidebar')">
        <el-icon size="20"><Fold /></el-icon>
      </el-button>

      <!-- 面包屑 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：工具 -->
    <div class="header-right">
      <!-- 通知 -->
      <el-badge :value="0" :max="99" class="header-icon-btn">
        <el-button text><el-icon size="20"><Bell /></el-icon></el-button>
      </el-badge>

      <!-- 主题切换 -->
      <el-tooltip :content="themeStore.isDark ? '切换亮色' : '切换暗色'" placement="bottom">
        <el-button text @click="themeStore.toggleTheme">
          <el-icon size="20">
            <Moon v-if="!themeStore.isDark" />
            <Sunny v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 语言切换 -->
      <el-dropdown @command="handleLocaleChange" trigger="click">
        <el-button text>
          <span class="locale-label">{{ localeStore.isZhCN ? '中文' : 'EN' }}</span>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="opt in LOCALE_OPTIONS"
              :key="opt.value"
              :command="opt.value"
              :disabled="locale === opt.value"
            >
              {{ opt.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户信息 -->
      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar :size="32" :src="userStore.avatar">
            {{ userStore.nickname?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <span class="username">{{ userStore.nickname }}</span>
          <el-icon><User /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/profile/index')">
              个人中心
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--qims-header-height);
  background: var(--qims-header-bg);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 99;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-icon-btn {
  :deep(.el-badge__content) {
    top: 6px;
    right: 6px;
  }
}

.locale-label {
  font-size: 13px;
  min-width: 28px;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .username {
    font-size: 13px;
    color: var(--qims-header-text);
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
