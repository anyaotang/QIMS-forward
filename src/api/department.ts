import request from './request'
import type { ApiResponse, DepartmentTreeNode } from '@/types/api'

export const departmentApi = {
  tree: () => request.get<ApiResponse<DepartmentTreeNode[]>>('/department/tree'),
  list: () => request.get<ApiResponse<DepartmentTreeNode[]>>('/department/list'),
  create: (data: Partial<DepartmentTreeNode>) => request.post('/department', data),
  update: (data: Partial<DepartmentTreeNode>) => request.put('/department', data),
  delete: (id: number) => request.delete(`/department/${id}`),
  inheritRole: (id: number, roleIds: number[]) =>
    request.post(`/department/${id}/inherit-role`, { roleIds }),
}