import request from './request'
import type { ApiResponse, UserInfo, UserForm, PageResult, PageQuery } from '@/types/api'

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