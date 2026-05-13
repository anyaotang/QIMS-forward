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

// 图标名 → Element Plus 图标组件映射
const iconComponents: Record<string, any> = {
  Setting, DataAnalysis, DataLine, Memo, User,
  OfficeBuilding, Key, Connection, DocumentChecked,
  List, Edit, TrendCharts, Tickets, ChatDotRound,
}

function resolveIcon(iconName?: string) {
  if (!iconName) return null
  return iconComponents[iconName] || null
}

function navigateTo(path: string) {
  router.push(path)
}

// 从 store 获取动态菜单树
const menuTree = computed<MenuDTO[]>(() => userStore.menus || [])

// 判断是否为叶子节点（有可点击路由）
function isLeaf(menu: MenuDTO): boolean {
  return !!menu.path
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
              <component :is="resolveIcon(menu.icon) || Setting" />
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
                :index="(grandChild.path || '')"
                @click="grandChild.path && navigateTo(grandChild.path)"
                :disabled="!grandChild.path"
              >
                <span>{{ grandChild.name }}</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 叶子节点（可直接跳转） -->
            <el-menu-item
              v-else
              :index="(child.path || '')"
              @click="child.path && navigateTo(child.path)"
              :disabled="!child.path"
            >
              <el-icon v-if="resolveIcon(child.icon)">
                <component :is="resolveIcon(child.icon)" />
              </el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 无子菜单的顶级菜单（叶子节点） -->
        <el-menu-item
          v-else-if="menu.path"
          :index="menu.path"
          @click="navigateTo(menu.path)"
        >
          <el-icon>
            <component :is="resolveIcon(menu.icon) || Setting" />
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
