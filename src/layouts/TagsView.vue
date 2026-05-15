<script setup lang="ts">
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
  { immediate: true },
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
  left: 210px;
  right: 0;
  height: 42px;
  background: var(--qims-header-bg);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 98;
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tags-scroll {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px 0;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: var(--el-color-primary);
    border-radius: 0 2px 2px 0;
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: rgba(64, 158, 255, 0.06);
    color: var(--el-color-primary);
    border-color: rgba(64, 158, 255, 0.3);
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.15);
    transform: translateY(-1px);

    &::before {
      height: 60%;
    }
  }

  &.active {
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
    color: #fff;
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
    font-weight: 500;

    &::before {
      height: 80%;
      background: #fff;
    }

    .tag-close {
      color: rgba(255, 255, 255, 0.9);

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
      }
    }
  }

  .tag-close {
    font-size: 12px;
    border-radius: 50%;
    padding: 2px;
    transition: all 0.2s;
    color: #909399;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #f56c6c;
    }
  }
}
</style>
