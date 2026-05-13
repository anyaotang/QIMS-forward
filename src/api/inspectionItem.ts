// ============ 检测项模块 ============
import request from '@/utils/request'
import type {
  ApiResponse,
  InspectionItem,
  PageResult,
  PageQuery,
  InspectionItemForm,
  DefaultValueGroup,
} from '@/types/api'

export const inspectionItemApi = {
  /** 分页查询检测项列表 */
  page: (params: PageQuery & {
    nodeId?: number;
    dataSource?: number;
    status?: number
  }) => request.get<ApiResponse<PageResult<InspectionItem>>>('/inspectionitem/page', {params}),
  /** 获取检测项详情 */
  detail: (id: number) => request.get<ApiResponse<InspectionItem>>('/inspectionitem/' + id),
  /** 创建检测项 */
  create: (data: InspectionItemForm) => request.post('/inspectionitem', data),
  /** 更新检测项 */
  update: (data: InspectionItemForm) => request.put('/inspectionitem', data),
  /** 删除检测项 */
  delete: (id: number) => request.delete('/inspectionitem/' + id),
  /** 启用/停用检测项 */
  toggleActive: (id: number, isActive: boolean) => request.post('/inspectionitem/' + id + '/toggle-active', {isActive}),
  /** 获取默认值分组列表 */
  defaultValueGroups: () => request.get<ApiResponse<DefaultValueGroup[]>>('/inspectionitem/default-value'),
  /** 创建默认值分组 */
  createDefaultValueGroup: (data: DefaultValueGroup) => request.post('/inspectionitem/default-value', data),
  /** 更新默认值分组 */
  updateDefaultValueGroup: (data: DefaultValueGroup) => request.put('/inspectionitem/default-value', data),
  /** 删除默认值分组 */
  deleteDefaultValueGroup: (groupName: string) => request.delete('/inspectionitem/default-value', {params: {groupName}}),
}
