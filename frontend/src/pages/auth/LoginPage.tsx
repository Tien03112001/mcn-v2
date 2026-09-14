import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/user'

const HOME_BY_ROLE: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken)
      navigate(HOME_BY_ROLE[data.user.role], { replace: true })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Đăng nhập</CardTitle>
          <CardDescription>Hệ thống ngân hàng đề thi &amp; thi online</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {mutation.isError && (
              <p className="text-sm text-destructive">Email hoặc mật khẩu không đúng.</p>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
