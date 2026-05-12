import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type {
  ApiResponse,
  LoginVO,
  UserInfo,
  DepartmentTreeNode,
  NodeTreeNode,
  InspectionItem,
  InspectionItemForm,
  DefaultValueGroup,
  InspectionRecord,
  ManualRecordForm,
  PageResult,
  PageQuery,
  QualityReport,
  ReportQuery,
  ImplementationPlan,
  FeedbackForm,
  Statistics,
  DictData,
  UserForm,
  NodeForm,
} from '@/types/api'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 统一响应数据提取
function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data as T
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qims_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const urlToken = new URLSearchParams(window.location.search).get('token')
    if (urlToken && !token) {
      config.headers.Authorization = `Bearer ${urlToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code === 0 || res.code === 200) {
      return response
    }
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('qims_token')
          localStorage.removeItem('qims_user')
          ElMessage.warning('登录已过期，请重新登录')
          window.location.href = '/login'
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
  }
)

// ============ 认证模块 ============
export const authApi = {
  login: (params: { username: string; password: string }) =>
    request.post<ApiResponse<LoginVO>>('/auth/login', params),
  urlLogin: (token: string) =>
    request.get<ApiResponse<LoginVO>>('/auth/url-login', { params: { token } }),
  logout: () => request.post('/auth/logout'),
}

// ============ 用户模块 ============
export const userApi = {
  info: () => request.get<ApiResponse<UserInfo>>('/user/info'),
  list: (params: PageQuery & { departmentId?: number; status?: number }) =>
    request.get<ApiResponse<PageResult<UserInfo>>>('/user/page', { params }),
  create: (data: UserForm) => request.post('/user', data),
  update: (data: UserForm) => request.put('/user', data),
  delete: (id: number) => request.delete(`/user/${id}`),
  resetPassword: (id: number) => request.post(`/user/${id}/reset-password`),
  permissions: () => request.get<ApiResponse<string[]>>('/user/permissions'),
  hasPermission: (code: string) =>
    request.get<ApiResponse<boolean>>('/user/has-permission', { params: { code } }),
}

// ============ 部门模块 ============
export const departmentApi = {
  tree: () => request.get<ApiResponse<DepartmentTreeNode[]>>('/department/tree'),
  list: () => request.get<ApiResponse<DepartmentTreeNode[]>>('/department/list'),
  create: (data: Partial<DepartmentTreeNode>) => request.post('/department', data),
  update: (data: Partial<DepartmentTreeNode>) => request.put('/department', data),
  delete: (id: number) => request.delete(`/department/${id}`),
  inheritRole: (id: number, roleIds: number[]) =>
    request.post(`/department/${id}/inherit-role`, { roleIds }),
}

// ============ 节点模块 ============
export const nodeApi = {
  tree: (params?: { type?: number; keyword?: string }) =>
    request.get<ApiResponse<NodeTreeNode[]>>('/node/tree', { params }),
  list: (params?: PageQuery & { type?: number; parentId?: number }) =>
    request.get<ApiResponse<PageResult<NodeTreeNode>>>('/node/list', { params }),
  create: (data: NodeForm) => request.post('/node', data),
  update: (data: NodeForm) => request.put('/node', data),
  delete: (id: number) => request.delete(`/node/${id}`),
  move: (id: number, parentId: number | null, orderNum: number) =>
    request.post(`/node/${id}/move`, { parentId, orderNum }),
}

// ============ 检测项模块 ============
export const inspectionItemApi = {
  page: (params: PageQuery & { nodeId?: number; dataSource?: number; status?: number }) =>
    request.get<ApiResponse<PageResult<InspectionItem>>>('/inspectionitem/page', { params }),
  detail: (id: number) => request.get<ApiResponse<InspectionItem>>(`/inspectionitem/${id}`),
  create: (data: InspectionItemForm) => request.post('/inspectionitem', data),
  update: (data: InspectionItemForm) => request.put('/inspectionitem', data),
  delete: (id: number) => request.delete(`/inspectionitem/${id}`),
  toggleActive: (id: number, isActive: boolean) =>
    request.post(`/inspectionitem/${id}/toggle-active`, { isActive }),
  defaultValueGroups: () =>
    request.get<ApiResponse<DefaultValueGroup[]>>('/inspectionitem/default-value'),
  createDefaultValueGroup: (data: DefaultValueGroup) =>
    request.post('/inspectionitem/default-value', data),
  updateDefaultValueGroup: (data: DefaultValueGroup) =>
    request.put('/inspectionitem/default-value', data),
  deleteDefaultValueGroup: (groupName: string) =>
    request.delete('/inspectionitem/default-value', { params: { groupName } }),
}

// ============ 检测记录模块 ============
export const recordApi = {
  page: (params: PageQuery & { itemId?: number; nodeId?: number; startDate?: string; endDate?: string }) =>
    request.get<ApiResponse<PageResult<InspectionRecord>>>('/record/page', { params }),
  manual: (data: ManualRecordForm) => request.post('/record/manual', data),
}

// ============ 报表模块 ============
export const reportApi = {
  quality: (params: ReportQuery) =>
    request.get<ApiResponse<PageResult<QualityReport>>>('/report/quality', { params }),
  export: (params: ReportQuery): Promise<Blob> =>
    request.get(`${import.meta.env.VITE_API_BASE_URL || '/api'}/report/quality/export`, {
      params,
      responseType: 'blob',
    }) as unknown as Promise<Blob>,
}

// ============ 实施方案模块 ============
export const implementationApi = {
  planTree: (params?: { nodeId?: number; status?: number }) =>
    request.get<ApiResponse<ImplementationPlan[]>>('/implementation/plan/tree', { params }),
  submitFeedback: (data: FeedbackForm) => request.post('/implementation/feedback', data),
}

// ============ 统计模块 ============
export const statisticsApi = {
  dashboard: () => request.get<ApiResponse<Statistics>>('/statistics'),
}

// ============ 字典模块 ============
export const dictApi = {
  list: (type: string) =>
    request.get<ApiResponse<DictData[]>>('/dict/list', { params: { type } }),
}

// 导出工具函数供 store 复用
export { extractData }
