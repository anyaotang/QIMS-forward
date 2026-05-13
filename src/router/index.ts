/**
 * 路由配置 + 全局守卫
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

// ============ 静态路由（无需权限，始终注册）============
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
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
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'User', hidden: true },
      },
    ],
  },
]

// ============ 动态路由（需权限过滤）============
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'user:manage' },
      },
      {
        path: 'department',
        name: 'DepartmentManagement',
        component: () => import('@/views/system/department/index.vue'),
        meta: { title: '部门管理', icon: 'OfficeBuilding', permission: 'dept:manage' },
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'Key', permission: 'role:manage' },
      },
    ],
  },
  {
    path: '/quality',
    name: 'Quality',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/quality/node',
    meta: { title: '质量管理', icon: 'DataAnalysis' },
    children: [
      {
        path: 'node',
        name: 'NodeManagement',
        component: () => import('@/views/quality/node/index.vue'),
        meta: { title: '节点管理', icon: 'Connection', permission: 'node:manage' },
      },
      {
        path: 'inspection-item',
        name: 'InspectionItemManagement',
        component: () => import('@/views/quality/inspection-item/index.vue'),
        meta: { title: '检测项管理', icon: 'DocumentChecked', permission: 'item:manage' },
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
    meta: { title: '报表中心', icon: 'DataLine' },
    children: [
      {
        path: 'quality',
        name: 'QualityReport',
        component: () => import('@/views/report/quality/index.vue'),
        meta: { title: '质量报表', icon: 'TrendCharts', permission: 'report:view' },
      },
    ],
  },
  {
    path: '/implementation',
    name: 'Implementation',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/implementation/plan',
    meta: { title: '实施方案', icon: 'Memo' },
    children: [
      {
        path: 'plan',
        name: 'ImplementationPlan',
        component: () => import('@/views/implementation/plan/index.vue'),
        meta: { title: '实施方案', icon: 'Tickets', permission: 'plan:manage' },
      },
      {
        path: 'feedback',
        name: 'ImplementationFeedback',
        component: () => import('@/views/implementation/feedback/index.vue'),
        meta: { title: '反馈记录', icon: 'ChatDotRound' },
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
  routes: [...constantRoutes, ...asyncRoutes, ...errorRoutes],
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

// ============ 全局前置守卫 ============
router.beforeEach(async (to, _from) => {
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
      return '/dashboard'
    }
    return true
  }

  if (!userStore.isLoggedIn) {
    return `/login?redirect=${to.fullPath}`
  }

  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch {
      // fetchUserInfo 内部已捕获异常并返回 null
      // 如果失败，用户仍有 token 和权限，允许继续导航
    }
  }

  // 加载菜单树（页面刷新时需要重新获取）
  if (userStore.menus.length === 0) {
    try {
      await userStore.fetchMenus()
    } catch {
      // ignore - 菜单获取失败不阻断导航
    }
  }

  // 路由已在 createRouter 时全部注册，无需动态 addRoute
  // 权限过滤仅影响侧边栏菜单显示（通过 permissionStore.menuList）
  const permissionStore = usePermissionStore()
  if (!permissionStore.isMenuLoaded) {
    const filteredRoutes = permissionStore.filterRoutesByPermission(
      [...asyncRoutes] as any,
      userStore.permissions,
    )
    permissionStore.setRoutes([...constantRoutes, ...filteredRoutes] as any)
    permissionStore.setAddRoutes(filteredRoutes)
    permissionStore.isMenuLoaded = true
  }

  return true
})

router.afterEach(() => {
  NProgress.done()
})

export default router