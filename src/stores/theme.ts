/**
 * 主题状态管理
 * 支持亮色/暗色主题切换 + Element Plus CSS 变量覆盖
 */
import {defineStore} from 'pinia'

type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'qims_theme'

export const useThemeStore = defineStore('theme', () => {
  // ============ State ============
  const mode = ref<ThemeMode>((localStorage.getItem(THEME_KEY) as ThemeMode) || 'light')

  // ============ Getters ============
  const isDark = computed(() => mode.value === 'dark')

  // ============ Actions ============
  function setTheme(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem(THEME_KEY, newMode)
    applyTheme(newMode)
  }

  function toggleTheme() {
    setTheme(mode.value === 'light' ? 'dark' : 'light')
  }

  /** 将主题应用到 HTML 和 Element Plus */
  function applyTheme(theme: ThemeMode) {
    const html = document.documentElement

    if (theme === 'dark') {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
      // Element Plus 暗色主题
      document.body.classList.add('el-loading-parent--dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
      document.body.classList.remove('el-loading-parent--dark')
    }
  }

  // 初始化
  applyTheme(mode.value)

  // 监听变化
  watch(mode, (newVal: string) => {
    applyTheme(newVal)
  })

  return {
    mode,
    isDark,
    setTheme,
    toggleTheme,
  }
})
