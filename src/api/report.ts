import request from './request'
import type { ApiResponse, QualityReport, ReportQuery, PageResult } from '@/types/api'

export const reportApi = {
  quality: (params: ReportQuery) =>
    request.get<ApiResponse<PageResult<QualityReport>>>('/report/quality', { params }),
  export: (params: ReportQuery): Promise<Blob> =>
    request.get(`${import.meta.env.VITE_API_BASE_URL || '/api'}/report/quality/export`, {
      params,
      responseType: 'blob',
    }) as unknown as Promise<Blob>,
}