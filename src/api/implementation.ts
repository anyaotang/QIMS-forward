// ============ 实施方案模块 ============
import request from '@/utils/request'
import type {ApiResponse, ImplementationPlan, FeedbackForm} from '@/types/api'

export const implementationApi = {
  /** 获取实施方案树（按节点/状态筛选） */
  planTree: (params?: {
    nodeId?: number;
    status?: number
  }) => request.get<ApiResponse<ImplementationPlan[]>>('/implementation/plan/tree', {
    params
  }),
  /** 提交反馈 */
  submitFeedback: (data: FeedbackForm) =>
    request.post('/implementation/feedback', data),
  /** 新增方案 */
  addPlan: (data: Partial<ImplementationPlan>) =>
    request.post('/implementation/plan', data),
  /** 更新方案 */
  updatePlan: (data: Partial<ImplementationPlan>) =>
    request.put('/implementation/plan', data),
  /** 删除方案 */
  deletePlan: (id: number) =>
    request.delete(`/implementation/plan/${id}`),
}