import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { changePassword } from '@/lib/api/auth'
import { getErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/user'

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  teacher: 'Giảng viên',
  student: 'Sinh viên',
}

const CHANGE_PASSWORD_ERROR: Record<string, string> = {
  INVALID_CURRENT_PASSWORD: 'Mật khẩu hiện tại không đúng.',
}

function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword(form.currentPassword, form.newPassword),
    onSuccess: () => {
      toast.success('Đã đổi mật khẩu')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, CHANGE_PASSWORD_ERROR, 'Không thể đổi mật khẩu. Vui lòng thử lại.')),
  })

  const passwordsMismatch = form.newPassword.length > 0 && form.newPassword !== form.confirmPassword

  if (!user) return null

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Thông tin tài khoản</h1>
        <p className="mt-1 text-muted-foreground">Xem thông tin và đổi mật khẩu tài khoản của bạn.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm text-muted-foreground">Họ tên</span>
            <span className="font-medium">{user.fullName}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm text-muted-foreground">Vai trò</span>
            <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
          </div>
          {user.role === 'student' && (
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm text-muted-foreground">Mã số sinh viên</span>
              <span className="font-medium">{user.studentCode ?? '—'}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ngày tạo tài khoản</span>
            <span className="font-medium">{formatDateTime(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (passwordsMismatch) return
              changePasswordMutation.mutate()
            }}
          >
            <div className="flex flex-col gap-2">
              <Label>Mật khẩu hiện tại</Label>
              <Input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Mật khẩu mới</Label>
              <Input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                minLength={8}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Xác nhận mật khẩu mới</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                minLength={8}
                required
              />
              {passwordsMismatch && <p className="text-xs text-destructive">Mật khẩu xác nhận không khớp.</p>}
            </div>
            <div>
              <Button type="submit" disabled={changePasswordMutation.isPending || passwordsMismatch}>
                {changePasswordMutation.isPending ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
