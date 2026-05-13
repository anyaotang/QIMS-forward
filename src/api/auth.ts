import request from './request'
import type { ApiResponse, LoginVO } from '@/types/api'

export const authApi = {
  login: (params: { username: string; password: string }) =>
    request.post<ApiResponse<LoginVO>>('/auth/login', params),
  urlLogin: (token: string) =>
    request.get<ApiResponse<LoginVO>>('/auth/url-login', { params: { token } }),
  logout: () => request.post('/auth/logout'),
}