// ============ 检测记录模块 ============
import request from '@/utils/request'
import type {
  ApiResponse,
  PageResult,
  PageQuery,
  InspectionRecord,
  ManualRecordForm
} from '@/types/api'

export const recordApi = {
  /** 分页查询检测记录 */
  page: (params: PageQuery & {
    itemId?: number,
    nodeId?: number,
    startDate?: string,
    endDate?: string
  }) => request.get<ApiResponse<PageResult<InspectionRecord>>>('/record/page', {params}),
  /** 手动录入检测记录 */
  manual: (data: ManualRecordForm) => request.post('/record/manual', data),
}
