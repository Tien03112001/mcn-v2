import { create } from 'zustand'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  isHydrated: boolean
  setSession: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  setHydrated: (value: boolean) => void
  logout: () => void
}

/**
 * Auth state lives in memory only — the refresh token is an httpOnly
 * cookie the browser manages, and the access token is short-lived
 * enough that losing it on reload (then silently refreshing via the
 * cookie) is an acceptable trade-off for not persisting tokens to
 * localStorage.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  setSession: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setHydrated: (value) => set({ isHydrated: value }),
  logout: () => set({ user: null, accessToken: null }),
}))
