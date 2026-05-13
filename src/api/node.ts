import request from './request'
import type { ApiResponse, NodeTreeNode, NodeForm, PageResult, PageQuery } from '@/types/api'

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