import request from './request'
import type { ApiResponse, DictData } from '@/types/api'

export const dictApi = {
  list: (type: string) =>
    request.get<ApiResponse<DictData[]>>('/dict/list', { params: { type } }),
}