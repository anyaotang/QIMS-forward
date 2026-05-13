// ============ 节点模块 ============
import request from '@/utils/request'
import type { ApiResponse, NodeTreeNode, PageResult, PageQuery, NodeForm } from '@/types/api'

export function getNodeApi() {
  return {
    /** 获取节点树（嵌套结构） */
    tree: (params?: { type?: number; keyword?: string }) =>
      request.get<ApiResponse<NodeTreeNode[]>>('/node/tree', { params }),
    /** 分页查询节点列表 */
    list: (params?: PageQuery & { type?: number; parentId?: number }) =>
      request.get<ApiResponse<PageResult<NodeTreeNode>>>('/node/list', { params }),
    /** 创建节点 */
    create: (data: NodeForm) => request.post('/node', data),
    /** 更新节点 */
    update: (data: NodeForm) => request.put('/node', data),
    /** 删除节点 */
    delete: (id: number) => request.delete('/node/' + id),
    /** 移动节点（调整父子关系和排序） */
    move: (id: number, parentId: number | null, orderNum: number) =>
      request.post('/node/' + id + '/move', { parentId, orderNum }),
  }
}

/** 保持向后兼容的命名导出 */
export const nodeApi = getNodeApi()