/**
 * QIMS 质量检测管理系统 - 应用入口
 */
import {createApp} from 'vue'
import {createPinia} from 'pinia'

// Element Plus（自动导入样式 + 全局组件注册）
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// i18n
import i18n from '@/locales'

// 全局样式
import '@/styles/index.scss'

// v-permission 指令
import {permissionDirective} from '@/directives/permission'

// 根组件
import App from './App.vue'

// ============ 创建应用实例 ============
const app = createApp(App)

// ============ 注册全局组件 ============
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


// ============ 全局挂载 ElMessage ============
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    ElMessage: typeof import('element-plus')['ElMessage']
  }
}

// ============ 安装 Pinia（必须在路由之前）============
const pinia = createPinia()
app.use(pinia)

// ============ 注册全局指令 ============
app.directive('permission', permissionDirective)

// ============ 安装路由（动态导入确保 Pinia 先初始化）============
async function bootstrap() {
  const {default: router} = await import('@/router')
  app.use(router)
  app.use(i18n)
  app.use(ElementPlus)
  app.mount('#app')
}

bootstrap()
