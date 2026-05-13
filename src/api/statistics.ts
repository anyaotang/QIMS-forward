// ============ 统计模块 ============
import request from '@/utils/request'
import type {ApiResponse, Statistics} from '@/types/api'

export const statisticsApi = {
  /** 获取仪表盘统计数据 */
  dashboard: () => request.get<ApiResponse<Statistics>>('/statistics'),
}
