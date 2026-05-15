// ============ 检测任务模块 ============
import request from '@/utils/request'
import type {
  ApiResponse,
  PageResult,
  PageQuery,
  InspectionTask,
  InspectionTaskForm,
  InspectionTaskDetail,
  InspectionTaskItem,
} from '@/types/api'

export const inspectionTaskApi = {
  /** 分页查询检测任务列表 */
  page: (params: PageQuery & {
    nodeId?: number
    status?: number
    keyword?: string
    startDate?: string
    endDate?: string
  }) => request.get<ApiResponse<PageResult<InspectionTask>>>('/inspection-task/page', {params}),

  /** 获取任务详情（含检测项列表） */
  detail: (id: number) => request.get<ApiResponse<InspectionTaskDetail>>(`/inspection-task/${id}`),

  /** 创建检测任务 */
  create: (data: InspectionTaskForm) => request.post<ApiResponse<InspectionTask>>('/inspection-task', data),

  /** 更新检测任务 */
  update: (data: InspectionTaskForm) => request.put<ApiResponse<InspectionTask>>('/inspection-task', data),

  /** 删除检测任务 */
  delete: (id: number) => request.delete(`/inspection-task/${id}`),

  /** 启动任务（待检测 → 检测中） */
  start: (id: number) => request.post(`/inspection-task/${id}/start`),

  /** 完成任务（检测中 → 已完成） */
  complete: (id: number) => request.post(`/inspection-task/${id}/complete`),

  /** 取消任务 */
  cancel: (id: number) => request.post(`/inspection-task/${id}/cancel`),

  /** 录入某检测项的检测结果 */
  recordItem: (taskId: number, data: {
    itemId: number
    actualValue: number
    inspector?: string
    remark?: string
  }) => request.post(`/inspection-task/${taskId}/record`, data),

  /** 获取任务下的检测项列表 */
  items: (taskId: number) => request.get<ApiResponse<InspectionTaskItem[]>>(`/inspection-task/${taskId}/items`),
}
