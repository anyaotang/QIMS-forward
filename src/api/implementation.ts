import request from './request'
import type { ApiResponse, ImplementationPlan, FeedbackForm } from '@/types/api'

export const implementationApi = {
  planTree: (params?: { nodeId?: number; status?: number }) =>
    request.get<ApiResponse<ImplementationPlan[]>>('/implementation/plan/tree', { params }),
  submitFeedback: (data: FeedbackForm) => request.post('/implementation/feedback', data),
}