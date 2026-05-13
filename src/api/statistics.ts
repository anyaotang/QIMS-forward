import request from './request'
import type { ApiResponse, Statistics } from '@/types/api'

export const statisticsApi = {
  dashboard: () => request.get<ApiResponse<Statistics>>('/statistics'),
}