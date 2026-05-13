/** * 用户 & 认证状态管理 */
import {defineStore} from 'pinia'
import {authApi} from '@/api/auth'
import {userApi} from '@/api/user'
import {saveLoginData, clearLoginData, getToken} from '@/utils/auth'
import type {LoginForm, LoginVO, UserInfo, MenuDTO} from '@/types/api'
import {extractData} from "@/utils/request";

export const useUserStore = defineStore('user', () => {
  const token: Ref<string> = ref<string>(getToken() || '')
  const userInfo: Ref<UserInfo | null> = ref<UserInfo | null>(null)
  const permissions: Ref<string[]> = ref<string[]>([])
  const roles: Ref<string[]> = ref<string[]>([])
  const menus: Ref<MenuDTO[]> = ref<MenuDTO[]>([])
  const isLoading: Ref<boolean> = ref(false)
  const isLoggedIn: ComputedRef<boolean> = computed(() => !!token.value)
  const username: ComputedRef<string> = computed(() => userInfo.value?.username || '')
  const nickname: ComputedRef<string> = computed(() => userInfo.value?.nickname || username.value)
  const avatar: ComputedRef<string> = computed(() => userInfo.value?.avatar || '')
  const hasAdminRole: ComputedRef<boolean> = computed(() => roles.value.includes('admin') || roles.value.includes('ADMIN'))

  async function login(form: LoginForm) {
    isLoading.value = true
    try {
      const res = await authApi.login(form)
      const data: LoginVO = extractData(res)
      saveLoginData(data)
      token.value = data.token
      roles.value = data.roles || []
      permissions.value = data.permissions || []
// 尝试获取用户信息，但不让失败阻断登录
      await fetchUserInfo()
// 获取菜单树（不阻断登录）
      await fetchMenus()
      return data
    } finally {
      isLoading.value = false
    }
  }

  async function urlLogin(tokenStr: string) {
    isLoading.value = true
    try {
      const res = await authApi.urlLogin(tokenStr)
      const data: LoginVO = extractData(res)
      saveLoginData(data)
      token.value = data.token
      roles.value = data.roles || []
      permissions.value = data.permissions || []
      return data
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return null
    try {
      const res = await userApi.info()
      const data: UserInfo = extractData(res)
      userInfo.value = data
      roles.value = data.roles || []
      permissions.value = data.permissions || []
      return data
    } catch {
      // 不在此处调用 logout()——让调用方（登录流程或路由守卫）决定如何处理
// 避免登录成功后因 fetchUserInfo 失败而意外清除 token
      userInfo.value = null
      return null
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      clearLoginData()
      token.value = ''
      userInfo.value = null
      permissions.value = []
      roles.value = []
      menus.value = []
    }
  }

  function hasPermission(code: string): boolean {
    if (!code) return true
    return permissions.value.includes(code)
  }

  function hasRole(role: string): boolean {
    if (!role) return true
    return roles.value.includes(role)
  }

  async function fetchMenus() {
    if (!token.value) return []
    try {
      const res = await authApi.menus()
      const data = extractData(res) as MenuDTO[]
      menus.value = data || []
      return data
    } catch (e) {
      console.error('[UserStore] fetchMenus failed:', e)
      menus.value = []
      return []
    }
  }

  return {
    token, userInfo, permissions, roles, menus, isLoading,
    isLoggedIn, username, nickname, avatar, hasAdminRole,
    login, urlLogin, fetchUserInfo, logout, hasPermission, hasRole, fetchMenus,
  }
})
