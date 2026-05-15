// ============ 日志模块 ============
import request from '@/utils/request'
import type { ApiResponse, PageResult, PageQuery } from '@/types/api'
import type { LogInfo } from '@/types/api'

export const logApi = {
  /** 分页查询日志列表 */
  page: (params: PageQuery & {
    module?: string
    keyword?: string
  }) => request.get<ApiResponse<PageResult<LogInfo>>>('/log/page', { params }),

  /** 获取可选模块列表 */
  modules: () => request.get<ApiResponse<string[]>>('/log/modules'),
}
