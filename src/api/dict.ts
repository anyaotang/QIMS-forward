// ============ 字典模块 ============
import request from '@/utils/request'
import type {ApiResponse, DictData} from '@/types/api'

export const dictApi = {
  /** 按类型获取字典数据 */
  list: (type: string) => request.get<ApiResponse<DictData[]>>('/dict/list', {
    params: {type}
  }),
}
