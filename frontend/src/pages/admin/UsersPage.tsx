import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createUser, listUsers } from '@/lib/api/admin'
import type { UserRole } from '@/types/user'

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  teacher: 'Giảng viên',
  student: 'Sinh viên',
}

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter],
    queryFn: () => listUsers(roleFilter === 'all' ? undefined : { role: roleFilter }),
  })

  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student' as UserRole, studentCode: '' })

  const createMutation = useMutation({
    mutationFn: () =>
      createUser({
        ...form,
        studentCode: form.role === 'student' && form.studentCode ? form.studentCode : undefined,
      }),
    onSuccess: () => {
      toast.success('Tạo người dùng thành công')
      setOpen(false)
      setForm({ fullName: '', email: '', password: '', role: 'student', studentCode: '' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: () => toast.error('Không thể tạo người dùng'),
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Người dùng</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Thêm người dùng</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo người dùng mới</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
            >
              <div className="flex flex-col gap-2">
                <Label>Họ tên</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  minLength={8}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Vai trò</Label>
                <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Giảng viên</SelectItem>
                    <SelectItem value="student">Sinh viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.role === 'student' && (
                <div className="flex flex-col gap-2">
                  <Label>Mã số sinh viên</Label>
                  <Input
                    value={form.studentCode}
                    onChange={(e) => setForm((f) => ({ ...f, studentCode: e.target.value }))}
                  />
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 w-48">
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="teacher">Giảng viên</SelectItem>
            <SelectItem value="student">Sinh viên</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Mã SV</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Đang tải...
              </TableCell>
            </TableRow>
          )}
          {data?.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{ROLE_LABEL[user.role]}</TableCell>
              <TableCell>{user.studentCode ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
