// ============ 角色管理模块 ============
import request from '@/utils/request'
import type {ApiResponse, PageResult, PageQuery} from '@/types/api'

/** 角色信息 */
export interface RoleInfo {
  id: number
  name: string
  code: string
  status: number // 1=启用 0=禁用
  dataScope?: number // 数据范围
  remark?: string
  createTime?: string
  updateTime?: string
}

/** 角色表单 */
export interface RoleForm {
  id?: number
  name: string
  code: string
  status: number
  dataScope?: number
  remark?: string
}

/** 角色查询参数 */
export interface RoleQuery extends PageQuery {
  keyword?: string
}

export const roleApi = {
  /** 分页查询角色列表 */
  page: (params: RoleQuery) => request.get<ApiResponse<PageResult<RoleInfo>>>('/role/page', {params}),

  /** 获取所有角色（不分页，用于下拉选择） */
  list: () => request.get<ApiResponse<RoleInfo[]>>('/role/list'),

  /** 获取角色详情 */
  detail: (id: number) => request.get<ApiResponse<RoleInfo>>(`/role/${id}`),

  /** 新增角色 */
  create: (data: RoleForm) => request.post('/role', data),

  /** 更新角色 */
  update: (data: RoleForm) => request.put('/role', data),

  /** 删除角色 */
  delete: (id: number) => request.delete(`/role/${id}`),

  /** 获取角色的权限ID列表 */
  getPermissions: (roleId: number) => request.get<ApiResponse<number[]>>(`/role/${roleId}/permissions`),

  /** 为角色分配权限 */
  assignPermissions: (roleId: number, permissionIds: number[]) =>
    request.put(`/role/${roleId}/permissions`, permissionIds),
}
