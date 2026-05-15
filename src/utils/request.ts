import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'

// ============ 登录流程标记 ============
// 登录期间 fetchUserInfo/fetchMenus 可能因 token 尚未生效而触发 401，
// 此标记防止 401 拦截器在登录流程中执行硬跳转，导致登录成功后无法跳转
let _isLoginFlow = false

export function setLoginFlow(active: boolean): void {
  _isLoginFlow = active
}

// ============ 会话过期回调 ============
// 由应用层注册，用于清除 Pinia store 状态并软跳转到登录页
let _onSessionExpired: (() => void) | null = null

export function setOnSessionExpired(fn: () => void): void {
  _onSessionExpired = fn
}

// ============ 创建 axios 实例 ============
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ============ 请求拦截器 ============
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qims_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // URL 中的 token 参数优先（用于免登录访问）
    const urlToken = new URLSearchParams(window.location.search).get('token')
    if (urlToken) {
      config.headers.Authorization = `Bearer ${urlToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ============ 响应拦截器 ============
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code === 0 || res.code === 200) {
      return response
    }
    // 业务层 401（HTTP 200 但 code=401）
    if (res.code === 401) {
      if (!_isLoginFlow) {
        handleSessionExpired(res.message || '登录已过期')
      }
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 登录流程中不跳转——登录 API 刚返回 token，后续的 fetchUserInfo/fetchMenus
          // 可能因 token 尚未在服务端生效而暂时返回 401，不应覆盖登录成功状态
          if (!_isLoginFlow) {
            handleSessionExpired('登录已过期，请重新登录')
          }
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '网络请求失败')
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  },
)

/**
 * 会话过期统一处理：清除认证状态 + 软跳转到登录页
 * 使用回调机制避免循环依赖（request ← store ← router）
 */
function handleSessionExpired(message: string) {
  // 清除 localStorage
  localStorage.removeItem('qims_token')
  localStorage.removeItem('qims_user')

  ElMessage.warning(message)

  // 如果注册了会话过期回调，使用软跳转（清除 Pinia store + router.replace）
  if (_onSessionExpired) {
    _onSessionExpired()
  } else {
    // 回退：硬刷新（回调尚未注册时）
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
  }
}

export default request

// 统一响应数据提取（供 api/* 模块复用）
export function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data as T
}
