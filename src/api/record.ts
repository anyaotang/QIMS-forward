import request from './request'
import type { ApiResponse, InspectionRecord, ManualRecordForm, PageResult, PageQuery } from '@/types/api'

export const recordApi = {
  page: (params: PageQuery & { itemId?: number; nodeId?: number; startDate?: string; endDate?: string }) =>
    request.get<ApiResponse<PageResult<InspectionRecord>>>('/record/page', { params }),
  manual: (data: ManualRecordForm) => request.post('/record/manual', data),
}