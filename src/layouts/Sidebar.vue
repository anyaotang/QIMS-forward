<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { MenuDTO } from '@/types/api'
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
const userStore = useUserStore()

// 图标映射（权限编码 → Element Plus 图标）
const iconMap: Record<string, any> = {
  system:        Setting,
  inspection:    DataAnalysis,
  item_group:    DocumentChecked,
  record_group:  List,
  'plan:manage': Memo,
  'log:view':     ChatDotRound,
  'dept:manage':  OfficeBuilding,
  'user:manage':  User,
  'role:manage':  Key,
  'perm:manage':  Connection,
  'node:manage':  Connection,
  'node:view':    Connection,
  'item:manage':  DocumentChecked,
  'item:view':    DocumentChecked,
  'record:manual':Edit,
  'record:view':  List,
  'report:view':  TrendCharts,
  'report:export':DataLine,
}

// 路由路径映射（权限编码 → 前端路由 path）
const routeMap: Record<string, string> = {
  // 系统管理
  'dept:manage':   '/system/department',
  'user:manage':   '/system/user',
  'role:manage':   '/system/role',
  'perm:manage':   '/system/role',
  // 质量检测
  'node:manage':   '/quality/node',
  'node:view':     '/quality/node',
  // 检测项
  'item:manage':   '/quality/inspection-item',
  'item:view':     '/quality/inspection-item',
  // 检测记录
  'record:manual': '/quality/manual-entry',
  'record:view':   '/quality/inspection-record',
  // 报表
  'report:view':   '/report/quality',
  'report:export': '/report/quality',
  // 方案
  'plan:manage':   '/implementation/plan',
  // 日志（按钮，无路由）
}

function getIcon(code?: string) {
  if (!code) return null
  return iconMap[code] || iconMap[code.replace(':', '')] || null
}

function getRoutePath(code?: string): string | undefined {
  if (!code) return undefined
  return routeMap[code]
}

function isActive(path: string) {
  return route.path.startsWith(path)
}

function navigateTo(path: string) {
  router.push(path)
}

// 从 store 获取动态菜单树
const menuTree = computed<MenuDTO[]>(() => userStore.menus || [])

// 判断是否为叶子节点（有可点击路由）
function isLeaf(menu: MenuDTO): boolean {
  return !!getRoutePath(menu.code)
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="/favicon.ico" alt="QIMS" class="logo-icon" />
      <span v-if="!collapsed" class="logo-text">QIMS</span>
    </div>

    <!-- 动态菜单 -->
    <el-menu
      :default-active="route.path"
      :collapse="collapsed"
      :collapse-transition="false"
      background-color="var(--qims-sidebar-bg)"
      text-color="var(--qims-sidebar-text)"
      active-text-color="#409eff"
      class="sidebar-menu"
    >
      <!-- 仪表盘（固定显示） -->
      <el-menu-item index="/dashboard" @click="navigateTo('/dashboard')">
        <el-icon><Odometer /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>

      <!-- 动态渲染后端返回的菜单树 -->
      <template v-for="menu in menuTree" :key="menu.id">
        <!-- 有子菜单 → sub-menu -->
        <el-sub-menu
          v-if="menu.children && menu.children.length > 0"
          :index="'menu-' + menu.id"
        >
          <template #title>
            <el-icon>
              <component :is="getIcon(menu.code) || Setting" />
            </el-icon>
            <span>{{ menu.name }}</span>
          </template>

          <!-- 子菜单项 -->
          <template v-for="child in menu.children" :key="child.id">
            <!-- 第三级菜单 -->
            <el-sub-menu
              v-if="child.children && child.children.length > 0"
              :index="'menu-' + child.id"
            >
              <template #title>
                <span>{{ child.name }}</span>
              </template>
              <el-menu-item
                v-for="grandChild in child.children"
                :key="grandChild.id"
                :index="(getRoutePath(grandChild.code) || '')"
                @click="getRoutePath(grandChild.code) && navigateTo(getRoutePath(grandChild.code)!)"
                :disabled="!isLeaf(grandChild)"
              >
                <span>{{ grandChild.name }}</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 叶子节点（可直接跳转） -->
            <el-menu-item
              v-else
              :index="(getRoutePath(child.code) || '')"
              @click="getRoutePath(child.code) && navigateTo(getRoutePath(child.code)!)"
              :disabled="!isLeaf(child)"
            >
              <el-icon v-if="getIcon(child.code)">
                <component :is="getIcon(child.code)" />
              </el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 无子菜单的顶级菜单（叶子节点） -->
        <el-menu-item
          v-else-if="isLeaf(menu)"
          :index="(getRoutePath(menu.code) || '')"
          @click="navigateTo(getRoutePath(menu.code)!)"
        >
          <el-icon>
            <component :is="getIcon(menu.code) || Setting" />
          </el-icon>
          <template #title>{{ menu.name }}</template>
        </el-menu-item>
      </template>
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
