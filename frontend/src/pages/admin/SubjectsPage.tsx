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
import { createSubject, listSubjects } from '@/lib/api/admin'

export default function SubjectsPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', description: '' })
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã môn</TableHead>
            <TableHead>Tên môn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                Đang tải...
              </TableCell>
            </TableRow>
          )}
          {subjects?.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell>{subject.code}</TableCell>
              <TableCell>{subject.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
