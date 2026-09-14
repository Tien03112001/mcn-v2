import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { listSubjects } from '@/lib/api/admin'
import { createExam, listExams } from '@/lib/api/exams'
import type { ExamStatus } from '@/types/exam'

const STATUS_LABEL: Record<ExamStatus, string> = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  archived: 'Lưu trữ',
}

const STATUS_VARIANT: Record<ExamStatus, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
}

export default function ExamsPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ subjectId: '', title: '', durationMinutes: '45', totalScore: '10' })
  const queryClient = useQueryClient()

  const { data: subjects } = useQuery({ queryKey: ['admin', 'subjects'], queryFn: listSubjects })
  const { data, isLoading } = useQuery({ queryKey: ['teacher', 'exams'], queryFn: listExams })

  const createMutation = useMutation({
    mutationFn: () =>
      createExam({
        subjectId: Number(form.subjectId),
        title: form.title,
        durationMinutes: Number(form.durationMinutes),
        totalScore: Number(form.totalScore),
      }),
    onSuccess: (exam) => {
      toast.success('Tạo đề thi thành công')
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] })
      navigate(`/teacher/exams/${exam.id}`)
    },
    onError: () => toast.error('Không thể tạo đề thi'),
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Đề thi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tạo đề thi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo đề thi mới</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
            >
              <div className="flex flex-col gap-2">
                <Label>Môn học</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tiêu đề đề thi</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Thời gian (phút)</Label>
                  <Input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Tổng điểm</Label>
                  <Input
                    type="number"
                    value={form.totalScore}
                    onChange={(e) => setForm((f) => ({ ...f, totalScore: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || !form.subjectId}>
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
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
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
          {data?.data.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>
                <Link to={`/teacher/exams/${exam.id}`} className="hover:underline">
                  {exam.title}
                </Link>
              </TableCell>
              <TableCell>{exam.durationMinutes} phút</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[exam.status]}>{STATUS_LABEL[exam.status]}</Badge>
              </TableCell>
              <TableCell>
                {exam.status === 'published' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/teacher/exams/${exam.id}/results`}>Kết quả</Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
