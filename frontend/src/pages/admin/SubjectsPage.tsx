import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'
import { createSubject, deleteSubject, listSubjects, updateSubject, type Subject } from '@/lib/api/admin'
import { getErrorMessage } from '@/lib/api-error'

const DELETE_SUBJECT_ERROR: Record<string, string> = {
  SUBJECT_IN_USE: 'Không thể xóa: môn học này đang được dùng trong câu hỏi hoặc đề thi.',
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

export default function SubjectsPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', description: '' })
  const [editing, setEditing] = useState<Subject | null>(null)
  const [editForm, setEditForm] = useState({ code: '', name: '' })
  const queryClient = useQueryClient()

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: listSubjects,
  })

  const createMutation = useMutation({
    mutationFn: () => createSubject({ ...form, description: form.description || undefined }),
    onSuccess: () => {
      toast.success('Tạo môn học thành công')
      setOpen(false)
      setForm({ code: '', name: '', description: '' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] })
    },
    onError: () => toast.error('Không thể tạo môn học (mã môn có thể đã tồn tại)'),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error('NO_SUBJECT')
      return updateSubject(editing.id, editForm)
    },
    onSuccess: () => {
      toast.success('Đã cập nhật môn học')
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] })
    },
    onError: () => toast.error('Không thể cập nhật môn học (mã môn có thể đã tồn tại)'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubject(id),
    onSuccess: () => {
      toast.success('Đã xóa môn học')
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, DELETE_SUBJECT_ERROR, 'Không thể xóa môn học')),
  })

  function openEdit(subject: Subject) {
    setEditing(subject)
    setEditForm({ code: subject.code, name: subject.name })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Môn học</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Thêm môn học</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo môn học mới</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
            >
              <div className="flex flex-col gap-2">
                <Label>Mã môn</Label>
                <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tên môn</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa môn học</DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              updateMutation.mutate()
            }}
          >
            <div className="flex flex-col gap-2">
              <Label>Mã môn</Label>
              <Input
                value={editForm.code}
                onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tên môn</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã môn</TableHead>
            <TableHead>Tên môn</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Chỉnh sửa lúc</TableHead>
            <TableHead />
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
          {subjects?.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell>{subject.code}</TableCell>
              <TableCell>{subject.name}</TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(subject.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(subject.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(subject)}>
                    Sửa
                  </Button>
                  <ConfirmDeleteButton
                    title={`Xóa môn học "${subject.name}"?`}
                    description="Hành động này không thể hoàn tác."
                    pending={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate(subject.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
