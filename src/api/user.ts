// ============ 用户模块 ============
import request from '@/utils/request'
import type { ApiResponse, UserInfo, PageResult, PageQuery, UserForm } from '@/types/api'

export const userApi = {
  /** 获取当前用户信息 */
  info: () => request.get<ApiResponse<UserInfo>>('/user/info'),
  /** 分页查询用户列表 */
  list: (
    params: PageQuery & {
      departmentId?: number
      status?: number
    },
  ) => request.get<ApiResponse<PageResult<UserInfo>>>('/user/page', { params }),
  /** 创建用户 */
  create: (data: UserForm) => request.post('/user', data),
  /** 更新用户 */
  update: (data: UserForm) => request.put('/user', data),
  /** 删除用户 */
  delete: (id: string) => request.delete('/user/' + id),
  /** 重置密码 */
  resetPassword: (id: string) => request.post('/user/' + id + '/reset-password'),
  /** 获取当前用户权限码列表 */
  permissions: () => request.get<ApiResponse<string[]>>('/user/permissions'),
  /** 检查是否有指定权限 */
  hasPermission: (code: string) =>
    request.get<ApiResponse<boolean>>('/user/has-permission', {
      params: {
        code,
      },
    }),
}
