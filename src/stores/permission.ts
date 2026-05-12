/**
 * 权限状态管理
 * 动态路由生成、菜单权限过滤
 */
import {defineStore} from 'pinia'
import {useUserStore} from './user'

export interface AppRouteRecordRaw {
  path: string
  name?: string | symbol
  component?: unknown
  redirect?: string
  meta?: {
    title?: string
    icon?: string
    permission?: string | string[]
    hidden?: boolean
    keepAlive?: boolean
    affix?: boolean
    badge?: string | number
  }
  children?: AppRouteRecordRaw[]
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<AppRouteRecordRaw[]>([])
  const addRoutes = ref<AppRouteRecordRaw[]>([])
  const isMenuLoaded = ref(false)

  const menuList: ComputedRef<AppRouteRecordRaw[]> = computed(() => filterHidden(routes.value))
  const flatRoutes: ComputedRef<AppRouteRecordRaw[]> = computed(() => getFlatRoutes(routes.value))

  function filterHidden(routes: AppRouteRecordRaw[]): AppRouteRecordRaw[] {
    return routes
      .filter((r) => !r.meta?.hidden)
      .map((r) => ({
        ...r,
        children: r.children ? filterHidden(r.children) : undefined,
      })) as AppRouteRecordRaw[]
  }

  function getFlatRoutes(routes: AppRouteRecordRaw[]): AppRouteRecordRaw[] {
    const result: AppRouteRecordRaw[] = []
    for (const r of routes) {
      if (!r.meta?.hidden) {
        result.push(r)
        if (r.children) {
          result.push(...getFlatRoutes(r.children))
        }
      }
    }
    return result
  }

  function filterRoutesByPermission(
    allRoutes: AppRouteRecordRaw[],
    _permissions: string[]
  ): AppRouteRecordRaw[] {
    const userStore = useUserStore()
    return allRoutes
      .filter((route) => {
        const required = route.meta?.permission
        if (!required) return true
        if (Array.isArray(required)) {
          return required.some((p) => userStore.hasPermission(p))
        }
        return userStore.hasPermission(required)
      })
      .map((route) => ({
        ...route,
        children: route.children
          ? (filterRoutesByPermission(route.children, _permissions) as AppRouteRecordRaw[])
          : undefined,
      })) as AppRouteRecordRaw[]
  }

  function setRoutes(newRoutes: AppRouteRecordRaw[]) {
    routes.value = newRoutes
  }

  function setAddRoutes(newRoutes: AppRouteRecordRaw[]) {
    addRoutes.value = newRoutes
  }

  return {
    routes, addRoutes, isMenuLoaded, menuList, flatRoutes,
    filterHidden, filterRoutesByPermission, setRoutes, setAddRoutes,
  }
})
