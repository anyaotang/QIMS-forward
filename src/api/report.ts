// ============ 报表模块 ============
import request from '@/utils/request'
import type {ApiResponse, PageResult, QualityReport, ReportQuery} from '@/types/api'

export const reportApi = {
  /** 质量报表（分页） */
  quality: (params: ReportQuery) => request.get<ApiResponse<PageResult<QualityReport>>>('/report/quality', {params}),
  /** 导出质量报表（Blob） */
  export: (params: ReportQuery): Promise<Blob> => request.get('/api/report/quality/export', {
    params,
    responseType: 'blob',
  }) as unknown as Promise<Blob>,
}
