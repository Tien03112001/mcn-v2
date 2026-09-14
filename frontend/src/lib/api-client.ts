import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // send the httpOnly refresh_token cookie
})

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post<{ data: { accessToken: string } }>(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  )
  const accessToken = data.data.accessToken
  useAuthStore.getState().setAccessToken(accessToken)
  return accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: { code?: string } }>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const errorCode = error.response?.data?.error?.code

    const isExpiredAccessToken = error.response?.status === 401 && errorCode === 'TOKEN_EXPIRED'

    if (isExpiredAccessToken && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const accessToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    if (error.response?.status === 401 && !isExpiredAccessToken) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  }
)

export default apiClient
