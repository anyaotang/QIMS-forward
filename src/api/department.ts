// ============ 部门模块 ============
import request from '@/utils/request'
import type { ApiResponse, DepartmentTreeNode } from '@/types/api'

export function getDepartmentApi() {
  return {
    /** 获取部门树（嵌套结构） */
    tree: () => request.get<ApiResponse<DepartmentTreeNode[]>>('/department/tree'),
    /** 获取部门列表（平铺） */
    list: () => request.get<ApiResponse<DepartmentTreeNode[]>>('/department/list'),
    /** 创建部门 */
    create: (data: Partial<DepartmentTreeNode>) => request.post('/department', data),
    /** 更新部门 */
    update: (data: Partial<DepartmentTreeNode>) => request.put('/department', data),
    /** 删除部门 */
    delete: (id: number) => request.delete('/department/' + id),
    /** 部门继承角色 */
    inheritRole: (id: number, roleIds: number[]) =>
      request.post('/department/' + id + '/inherit-role', { roleIds }),
  }
}

/** 保持向后兼容的命名导出 */
export const departmentApi = getDepartmentApi()