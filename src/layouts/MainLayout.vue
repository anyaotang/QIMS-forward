<script setup lang="ts">
import { useRoute, RouterView } from 'vue-router'
import Sidebar from './Sidebar.vue'
import HeaderBar from './Header.vue'
import TagsView from './TagsView.vue'
import { usePermissionStore } from '@/stores/permission'

const permissionStore = usePermissionStore()
const route = useRoute()
const isCollapsed = ref(false)

const mainStyle = computed(() => ({
  // marginLeft: isCollapsed.value ? '64px' : '220px',
  marginTop: '112px',
  transition: 'margin-left 0.3s',
}))

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <Sidebar :collapsed="isCollapsed" />

    <!-- 主内容区 -->
    <div class="main-container" :class="{ collapsed: isCollapsed }">
      <!-- 顶栏 -->
      <HeaderBar @toggle-sidebar="toggleSidebar" />

      <!-- 标签导航 -->
      <TagsView />

      <!-- 页面内容 -->
      <main class="app-main" :style="mainStyle">
        <RouterView v-slot="{ Component, route: r }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="r.path" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-wrapper {
  min-height: 100vh;
  background: var(--qims-content-bg);
}

.main-container {
  margin-left: 220px;
  min-height: 100vh;
  transition: margin-left 0.3s;
  display: flex;
  flex-direction: column;

  &.collapsed {
    margin-left: 64px;
  }
}

.app-main {
  min-height: calc(100vh - 112px);
  padding: 16px;
  overflow-x: hidden;
}
</style>
