import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { createClass, listClasses } from '@/lib/api/admin'

export default function ClassesPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', academicYear: '' })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: () => listClasses(),
  })

  const createMutation = useMutation({
    mutationFn: () => createClass({ ...form, academicYear: form.academicYear || undefined }),
    onSuccess: () => {
      toast.success('Tạo lớp thành công')
      setOpen(false)
      setForm({ code: '', name: '', academicYear: '' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] })
    },
    onError: () => toast.error('Không thể tạo lớp (mã lớp có thể đã tồn tại)'),
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lớp học</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Thêm lớp</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo lớp mới</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
            >
              <div className="flex flex-col gap-2">
                <Label>Mã lớp</Label>
                <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tên lớp</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Niên khóa</Label>
                <Input
                  value={form.academicYear}
                  onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}
                  placeholder="2025-2026"
                />
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã lớp</TableHead>
            <TableHead>Tên lớp</TableHead>
            <TableHead>Niên khóa</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Đang tải...
              </TableCell>
            </TableRow>
          )}
          {data?.data.map((klass) => (
            <TableRow key={klass.id}>
              <TableCell>{klass.code}</TableCell>
              <TableCell>{klass.name}</TableCell>
              <TableCell>{klass.academicYear ?? '—'}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/classes/${klass.id}`}>Chi tiết</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
