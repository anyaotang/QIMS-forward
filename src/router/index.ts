/**
 * 路由配置 + 全局守卫
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

// ============ 静态路由（无需权限）============
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
]

// ============ 动态路由（需权限）============
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { title: '首页' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer', affix: true },
      },
    ],
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting', permission: 'system:view' },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'user:view' },
      },
      {
        path: 'department',
        name: 'DepartmentManagement',
        component: () => import('@/views/system/department/index.vue'),
        meta: { title: '部门管理', icon: 'OfficeBuilding', permission: 'department:view' },
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'Key', permission: 'role:view' },
      },
    ],
  },
  {
    path: '/quality',
    name: 'Quality',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/quality/node',
    meta: { title: '质量管理', icon: 'DataAnalysis', permission: 'quality:view' },
    children: [
      {
        path: 'node',
        name: 'NodeManagement',
        component: () => import('@/views/quality/node/index.vue'),
        meta: { title: '节点管理', icon: 'Connection', permission: 'node:view' },
      },
      {
        path: 'inspection-item',
        name: 'InspectionItemManagement',
        component: () => import('@/views/quality/inspection-item/index.vue'),
        meta: { title: '检测项管理', icon: 'DocumentChecked', permission: 'inspection:view' },
      },
      {
        path: 'inspection-record',
        name: 'InspectionRecord',
        component: () => import('@/views/quality/inspection-record/index.vue'),
        meta: { title: '检测记录', icon: 'List', permission: 'record:view' },
      },
      {
        path: 'manual-entry',
        name: 'ManualEntry',
        component: () => import('@/views/quality/manual-entry/index.vue'),
        meta: { title: '人工录入', icon: 'Edit', permission: 'record:manual' },
      },
    ],
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/report/quality',
    meta: { title: '报表中心', icon: 'DataLine', permission: 'report:view' },
    children: [
      {
        path: 'quality',
        name: 'QualityReport',
        component: () => import('@/views/report/quality/index.vue'),
        meta: { title: '质量报表', icon: 'TrendCharts', permission: 'report:quality' },
      },
    ],
  },
  {
    path: '/implementation',
    name: 'Implementation',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/implementation/plan',
    meta: { title: '实施方案', icon: 'Memo', permission: 'implementation:view' },
    children: [
      {
        path: 'plan',
        name: 'ImplementationPlan',
        component: () => import('@/views/implementation/plan/index.vue'),
        meta: { title: '实施方案', icon: 'Tickets', permission: 'implementation:plan' },
      },
      {
        path: 'feedback',
        name: 'ImplementationFeedback',
        component: () => import('@/views/implementation/feedback/index.vue'),
        meta: { title: '反馈记录', icon: 'ChatDotRound', permission: 'implementation:feedback' },
      },
    ],
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/profile/index',
    meta: { title: '个人中心', hidden: true },
    children: [
      {
        path: 'index',
        name: 'ProfileIndex',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'User' },
      },
    ],
  },
]

// ============ 404 ============
export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
]

// ============ 创建路由实例 ============
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes],
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

// ============ 全局前置守卫 ============
router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  document.title = `${(to.meta?.title as string) || ''} - QIMS 质量检测管理系统`.trim()

  const userStore = useUserStore()

  // 检查 URL 中是否有 token 参数
  const urlToken = new URLSearchParams(window.location.search).get('token')
  if (urlToken && !userStore.isLoggedIn) {
    try {
      await userStore.urlLogin(urlToken)
    } catch {
      // ignore
    }
  }

  if (to.path === '/login') {
    if (userStore.isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }

  if (!userStore.isLoggedIn) {
    next(`/login?redirect=${to.fullPath}`)
    return
  }

  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch {
      next('/login')
      return
    }
  }

  const permissionStore = usePermissionStore()
  if (!permissionStore.isMenuLoaded) {
    const filteredRoutes = permissionStore.filterRoutesByPermission([...asyncRoutes] as any, userStore.permissions)
    permissionStore.setRoutes([...asyncRoutes] as any)
    permissionStore.setAddRoutes(filteredRoutes)
    permissionStore.isMenuLoaded = true

    filteredRoutes.forEach((r: any) => {
      router.addRoute(r)
    })
    router.addRoute(errorRoutes[0]!)

    next({ ...to, replace: true })
    return
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
