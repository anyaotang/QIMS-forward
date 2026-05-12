<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

interface TagItem {
  path: string
  title: string
}

const visitedViews = ref<TagItem[]>([])
const activeTag = ref('')

// 初始化：添加首页
if (!visitedViews.value.find((v) => v.path === '/dashboard')) {
  visitedViews.value.push({ path: '/dashboard', title: '仪表盘' })
}

// 监听路由变化，添加标签
watch(
  () => route.path,
  (path) => {
    activeTag.value = path
    if (path === '/login') return
    const title = (route.meta?.title as string) || path
    if (!visitedViews.value.find((v) => v.path === path)) {
      visitedViews.value.push({ path, title })
    }
  },
  { immediate: true }
)

function goToTag(tag: TagItem) {
  router.push(tag.path)
}

function closeTag(tag: TagItem, index: number) {
  visitedViews.value.splice(index, 1)
  // 如果关闭的是当前标签，导航到上一个
  if (tag.path === activeTag.value) {
    const next = visitedViews.value[Math.max(0, index - 1)]
    if (next) router.push(next.path)
  }
}
</script>

<template>
  <div class="tags-view">
    <div class="tags-scroll">
      <div
        v-for="(tag, idx) in visitedViews"
        :key="tag.path"
        class="tag-item"
        :class="{ active: tag.path === activeTag }"
        @click="goToTag(tag)"
      >
        <span>{{ tag.title }}</span>
        <el-icon
          v-if="tag.path !== '/dashboard'"
          class="tag-close"
          @click.stop="closeTag(tag, idx)"
        >
          <Close />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tags-view {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  height: 40px;
  background: var(--qims-header-bg);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 98;
  display: flex;
  align-items: center;
  padding: 0 12px;
  overflow: hidden;
}

.tags-scroll {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: rgba(64, 158, 255, 0.08);
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }

  &.active {
    background: var(--el-color-primary);
    color: #fff;
    border-color: var(--el-color-primary);
  }

  .tag-close {
    font-size: 12px;
    border-radius: 50%;
    padding: 1px;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
