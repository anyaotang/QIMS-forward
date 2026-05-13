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
  submitFeedback: (data: FeedbackForm) => request.post('/implementation/feedback', data),
}
