import request from './request'
import type {
  ApiResponse,
  InspectionItem,
  InspectionItemForm,
  DefaultValueGroup,
  PageResult,
  PageQuery,
} from '@/types/api'

export const inspectionItemApi = {
  page: (params: PageQuery & { nodeId?: number; dataSource?: number; status?: number }) =>
    request.get<ApiResponse<PageResult<InspectionItem>>>('/inspectionitem/page', { params }),
  detail: (id: number) => request.get<ApiResponse<InspectionItem>>(`/inspectionitem/${id}`),
  create: (data: InspectionItemForm) => request.post('/inspectionitem', data),
  update: (data: InspectionItemForm) => request.put('/inspectionitem', data),
  delete: (id: number) => request.delete(`/inspectionitem/${id}`),
  toggleActive: (id: number, isActive: boolean) =>
    request.post(`/inspectionitem/${id}/toggle-active`, { isActive }),
  defaultValueGroups: () =>
    request.get<ApiResponse<DefaultValueGroup[]>>('/inspectionitem/default-value'),
  createDefaultValueGroup: (data: DefaultValueGroup) =>
    request.post('/inspectionitem/default-value', data),
  updateDefaultValueGroup: (data: DefaultValueGroup) =>
    request.put('/inspectionitem/default-value', data),
  deleteDefaultValueGroup: (groupName: string) =>
    request.delete('/inspectionitem/default-value', { params: { groupName } }),
}