// ============ 权限/菜单管理模块 ============
import request from '@/utils/request'
import type {ApiResponse, MenuDTO} from '@/types/api'

/** 菜单/权限表单 */
export interface MenuForm {
  id?: number
  name: string
  code: string
  type: number // 1=菜单 2=按钮
  parentId?: number | null
  sort?: number
  path?: string
  icon?: string
  permission?: string
  status?: number // 0=禁用 1=启用
}

export const permissionApi = {
  /** 获取菜单/权限树（完整树，含按钮级权限） */
  tree: () => request.get<ApiResponse<MenuDTO[]>>('/permission/tree'),

  /** 获取详情 */
  detail: (id: number) => request.get<ApiResponse<MenuDTO>>(`/permission/${id}`),

  /** 新增菜单/权限 */
  create: (data: MenuForm) => request.post<ApiResponse<MenuDTO>>('/permission', data),

  /** 更新菜单/权限 */
  update: (data: MenuForm) => request.put<ApiResponse<MenuDTO>>('/permission', data),

  /** 删除菜单/权限 */
  delete: (id: number) => request.delete(`/permission/${id}`),
}
