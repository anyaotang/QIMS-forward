/// <reference types="vite/client" />

// 环境变量
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Element Plus 全局组件类型
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    ElMessage: typeof import('element-plus')['ElMessage']
    ElMessageBox: typeof import('element-plus')['ElMessageBox']
    ElNotification: typeof import('element-plus')['ElNotification']
  }
}
