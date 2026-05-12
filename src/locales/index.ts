/**
 * vue-i18n 初始化
 *
 * ⚠️ 注意：此处不能调用 useLocaleStore()，因为 ES Module 的 import 是静态执行的，
 * 在 main.ts 执行 app.use(pinia) 之前就会运行，此时 Pinia 尚未安装，
 * 调用 store 会触发 "getActivePinia() was called but there was no active Pinia" 错误。
 * 因此直接从 localStorage 读取初始语言，与 locale store 保持同步。
 */
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const LOCALE_KEY = 'qims_locale'

function getInitialLocale(): string {
  return (localStorage.getItem(LOCALE_KEY) as string) || 'zh-CN'
}

export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
  missingWarn: false,
  fallbackWarn: false,
})

export default i18n
