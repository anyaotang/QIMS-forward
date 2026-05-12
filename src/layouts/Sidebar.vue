<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'
import {
  Odometer,
  Setting,
  DataAnalysis,
  DataLine,
  Memo,
  User,
  OfficeBuilding,
  Key,
  Connection,
  DocumentChecked,
  List,
  Edit,
  TrendCharts,
  Tickets,
  ChatDotRound,
} from '@element-plus/icons-vue'

const props = defineProps<{ collapsed: boolean }>()
const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const userStore = useUserStore()

// 图标映射
const iconMap: Record<string, unknown> = {
  Odometer,
  Setting,
  DataAnalysis,
  DataLine,
  Memo,
  User,
  OfficeBuilding,
  Key,
  Connection,
  DocumentChecked,
  List,
  Edit,
  TrendCharts,
  Tickets,
  ChatDotRound,
}

function getIcon(iconName?: string) {
  return iconName ? iconMap[iconName] || null : null
}

function isActive(path: string) {
  return route.path.startsWith(path)
}

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="/favicon.ico" alt="QIMS" class="logo-icon" />
      <span v-if="!collapsed" class="logo-text">QIMS</span>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="route.path"
      :collapse="collapsed"
      :collapse-transition="false"
      background-color="var(--qims-sidebar-bg)"
      text-color="var(--qims-sidebar-text)"
      active-text-color="#409eff"
      class="sidebar-menu"
    >
      <!-- 首页 -->
      <el-menu-item index="/dashboard" @click="navigateTo('/dashboard')">
        <el-icon><Odometer /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>

      <!-- 系统管理 -->
      <el-sub-menu v-if="userStore.hasPermission('system:view')" index="/system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item
          v-if="userStore.hasPermission('user:view')"
          index="/system/user"
          @click="navigateTo('/system/user')"
        >
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.hasPermission('department:view')"
          index="/system/department"
          @click="navigateTo('/system/department')"
        >
          <el-icon><OfficeBuilding /></el-icon>
          <span>部门管理</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.hasPermission('role:view')"
          index="/system/role"
          @click="navigateTo('/system/role')"
        >
          <el-icon><Key /></el-icon>
          <span>角色管理</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 质量管理 -->
      <el-sub-menu v-if="userStore.hasPermission('quality:view')" index="/quality">
        <template #title>
          <el-icon><DataAnalysis /></el-icon>
          <span>质量管理</span>
        </template>
        <el-menu-item
          v-if="userStore.hasPermission('node:view')"
          index="/quality/node"
          @click="navigateTo('/quality/node')"
        >
          <el-icon><Connection /></el-icon>
          <span>节点管理</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.hasPermission('inspection:view')"
          index="/quality/inspection-item"
          @click="navigateTo('/quality/inspection-item')"
        >
          <el-icon><DocumentChecked /></el-icon>
          <span>检测项管理</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.hasPermission('record:view')"
          index="/quality/inspection-record"
          @click="navigateTo('/quality/inspection-record')"
        >
          <el-icon><List /></el-icon>
          <span>检测记录</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.hasPermission('record:manual')"
          index="/quality/manual-entry"
          @click="navigateTo('/quality/manual-entry')"
        >
          <el-icon><Edit /></el-icon>
          <span>人工录入</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 报表中心 -->
      <el-sub-menu v-if="userStore.hasPermission('report:view')" index="/report">
        <template #title>
          <el-icon><DataLine /></el-icon>
          <span>报表中心</span>
        </template>
        <el-menu-item
          v-if="userStore.hasPermission('report:quality')"
          index="/report/quality"
          @click="navigateTo('/report/quality')"
        >
          <el-icon><TrendCharts /></el-icon>
          <span>质量报表</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 实施方案 -->
      <el-sub-menu v-if="userStore.hasPermission('implementation:view')" index="/implementation">
        <template #title>
          <el-icon><Memo /></el-icon>
          <span>实施方案</span>
        </template>
        <el-menu-item
          v-if="userStore.hasPermission('implementation:plan')"
          index="/implementation/plan"
          @click="navigateTo('/implementation/plan')"
        >
          <el-icon><Tickets /></el-icon>
          <span>实施方案</span>
        </el-menu-item>
        <el-menu-item
          v-if="userStore.hasPermission('implementation:feedback')"
          index="/implementation/feedback"
          @click="navigateTo('/implementation/feedback')"
        >
          <el-icon><ChatDotRound /></el-icon>
          <span>反馈记录</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;
  background: var(--qims-sidebar-bg);
  z-index: 100;
  transition: width 0.3s;
  overflow: hidden;

  &.collapsed {
    width: 64px;

    .logo-text {
      display: none;
    }

    .el-menu--collapse {
      width: 64px;
    }
  }
}

.sidebar-logo {
  height: var(--qims-header-height);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo-icon {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 2px;
    white-space: nowrap;
  }
}

.sidebar-menu {
  background: var(--qims-sidebar-bg) !important;
  border-right: none !important;

  &:not(.el-menu--collapse) {
    width: 220px;
  }

  .el-menu-item,
  :deep(.el-sub-menu__title) {
    color: var(--qims-sidebar-text) !important;

    &:hover {
      background: var(--qims-sidebar-hover-bg) !important;
    }

    &.is-active {
      background: var(--qims-sidebar-active-bg) !important;
      color: #409eff !important;
    }
  }
}
</style>
