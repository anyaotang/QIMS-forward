/**
 * 国际化状态管理
 */
import {defineStore} from 'pinia'

const LOCALE_KEY = 'qims_locale'

export type Locale = 'zh-CN' | 'en-US'

export const LOCALE_OPTIONS = [
  {label: '简体中文', value: 'zh-CN'},
  {label: 'English', value: 'en-US'},
]

export const useLocaleStore = defineStore('locale', () => {
  // ============ State ============
  const locale = ref<Locale>((localStorage.getItem(LOCALE_KEY) as Locale) || 'zh-CN')

  // ============ Getters ============
  const currentLocale = computed(() => locale.value)
  const isZhCN = computed(() => locale.value === 'zh-CN')

  // ============ Actions ============
  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    localStorage.setItem(LOCALE_KEY, newLocale)
  }

  return {
    locale,
    currentLocale,
    isZhCN,
    setLocale,
  }
})
