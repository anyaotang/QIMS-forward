/**
 * 认证工具函数
 */
import type { LoginVO } from '@/types/api'

const TOKEN_KEY = 'qims_token'
const USER_KEY = 'qims_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getTokenPayload(token?: string): Record<string, unknown> | null {
  try {
    const t = token || getToken()
    if (!t) return null
    const parts = t.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}

export function getStoredUser(): LoginVO | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: LoginVO): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function hasPermission(permission: string, userPermissions: string[]): boolean {
  if (!permission || !userPermissions?.length) return false
  return userPermissions.includes(permission)
}

export function hasAnyPermission(permissions: string[], userPermissions: string[]): boolean {
  if (!permissions?.length) return true
  return permissions.some((p) => hasPermission(p, userPermissions))
}

export function hasRole(role: string, userRoles: string[]): boolean {
  if (!role || !userRoles?.length) return false
  return userRoles.includes(role)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function saveLoginData(data: LoginVO): void {
  setToken(data.token)
  setStoredUser(data)
}

export function clearLoginData(): void {
  removeToken()
  removeStoredUser()
}
