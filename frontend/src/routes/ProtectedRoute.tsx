import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types/user'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
