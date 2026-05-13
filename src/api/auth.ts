// ============ 认证模块 ============
import request from '@/utils/request'
import type {ApiResponse, LoginVO, MenuDTO} from '@/types/api'

export const authApi = {
  login: (params: {
    username: string;
    password: string
  }) => request.post<ApiResponse<LoginVO>>('/auth/login', params),
  urlLogin: (token: string) => request.get<ApiResponse<LoginVO>>('/auth/url-login', {
    params: {token}
  }),
  logout: () => request.post('/auth/logout'),
  /** 获取用户菜单树（侧边栏动态渲染） */
  menus: () => request.get<ApiResponse<MenuDTO[]>>('/auth/menus'),
}
