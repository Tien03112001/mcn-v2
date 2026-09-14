import { useEffect } from 'react'
import axios from 'axios'
import apiClient from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '@/types/user'

/**
 * On app load there is no access token in memory yet (it's never
 * persisted), but the refresh_token cookie may still be valid. This
 * silently exchanges it for a fresh access token + user profile so a
 * page reload doesn't force a re-login.
 */
export function useBootstrapAuth() {
  const setSession = useAuthStore((s) => s.setSession)
  const setHydrated = useAuthStore((s) => s.setHydrated)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  useEffect(() => {
    if (isHydrated) return

    let cancelled = false

    async function bootstrap() {
      try {
        const refreshRes = await axios.post<{ data: { accessToken: string } }>(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const accessToken = refreshRes.data.data.accessToken
        const meRes = await apiClient.get<{ data: User }>('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!cancelled) {
          setSession(meRes.data.data, accessToken)
        }
      } catch {
        // No valid session — user needs to log in.
      } finally {
        if (!cancelled) setHydrated(true)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [isHydrated, setSession, setHydrated])
}

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  return { user, accessToken, isAuthenticated: Boolean(user && accessToken), isHydrated }
}
