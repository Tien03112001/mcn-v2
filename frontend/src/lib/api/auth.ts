import apiClient from '@/lib/api-client'
import type { User } from '@/types/user'

export interface LoginResponse {
  accessToken: string
  user: User
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ data: LoginResponse }>('/auth/login', { email, password })
  return data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
