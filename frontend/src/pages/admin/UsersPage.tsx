import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { Download, Upload } from 'lucide-react'
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
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'
import { PaginationControls } from '@/components/common/PaginationControls'
import {
  createUser,
  deactivateUser,
  downloadUserTemplate,
  importUsers,
  listUsers,
  updateUser,
} from '@/lib/api/admin'
import type { User, UserRole } from '@/types/user'

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  teacher: 'Giảng viên',
  student: 'Sinh viên',
}

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', email: '', role: 'student' as UserRole, studentCode: '' })
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter, page],
    queryFn: () => listUsers({ role: roleFilter === 'all' ? undefined : roleFilter, page }),
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
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể tạo người dùng')),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => deactivateUser(id),
    onSuccess: () => {
      toast.success('Đã vô hiệu hóa người dùng')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể vô hiệu hóa người dùng')),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: number) => updateUser(id, { isActive: true }),
    onSuccess: () => {
      toast.success('Đã kích hoạt lại người dùng')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể kích hoạt lại người dùng')),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error('NO_USER')
      return updateUser(editing.id, {
        ...editForm,
        studentCode: editForm.role === 'student' && editForm.studentCode ? editForm.studentCode : undefined,
      })
    },
    onSuccess: () => {
      toast.success('Đã cập nhật người dùng')
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể cập nhật người dùng (email có thể đã tồn tại)')),
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => importUsers(file),
    onSuccess: (result) => {
      const skippedNote = result.skipped.length > 0 ? `, bỏ qua ${result.skipped.length}` : ''
      toast.success(`Đã nhập ${result.created} người dùng${skippedNote}`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Nhập thất bại. Kiểm tra định dạng file Excel.')),
    onSettled: () => setIsImporting(false),
  })

  function openEdit(user: User) {
    setEditing(user)
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      studentCode: user.studentCode ?? '',
    })
  }

  function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    importMutation.mutate(file)
    e.target.value = ''
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Người dùng</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadUserTemplate()}>
            <Download className="size-3.5" />
            Tải file mẫu
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportFileChange}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            <Upload className="size-3.5" />
            {isImporting ? 'Đang nhập...' : 'Nhập từ Excel'}
          </Button>
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
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa người dùng</DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              updateMutation.mutate()
            }}
          >
            <div className="flex flex-col gap-2">
              <Label>Họ tên</Label>
              <Input
                value={editForm.fullName}
                onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Vai trò</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm((f) => ({ ...f, role: v as UserRole }))}
              >
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
            {editForm.role === 'student' && (
              <div className="flex flex-col gap-2">
                <Label>Mã số sinh viên</Label>
                <Input
                  value={editForm.studentCode}
                  onChange={(e) => setEditForm((f) => ({ ...f, studentCode: e.target.value }))}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mb-4 w-48">
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v as UserRole | 'all')
            setPage(1)
          }}
        >
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
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
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
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                    Sửa
                  </Button>
                  {user.isActive ? (
                    <ConfirmDeleteButton
                      label="Vô hiệu hóa"
                      title={`Vô hiệu hóa "${user.fullName}"?`}
                      description="Người dùng sẽ không thể đăng nhập cho đến khi được kích hoạt lại."
                      pending={deactivateMutation.isPending}
                      onConfirm={() => deactivateMutation.mutate(user.id)}
                    />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={reactivateMutation.isPending}
                      onClick={() => reactivateMutation.mutate(user.id)}
                    >
                      Kích hoạt lại
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data && (
        <PaginationControls
          currentPage={data.metadata.currentPage}
          lastPage={data.metadata.lastPage}
          total={data.metadata.total}
          perPage={data.metadata.perPage}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
