import { useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { listClasses } from '@/lib/api/admin'
import { listQuestions } from '@/lib/api/questions'
import {
  addExamQuestion,
  assignExamClass,
  getExam,
  listExamClasses,
  listExamQuestions,
  publishExam,
  removeExamQuestion,
} from '@/lib/api/exams'

export default function ExamEditorPage() {
  const { id } = useParams<{ id: string }>()
  const examId = Number(id)
  const queryClient = useQueryClient()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [scoreDraft, setScoreDraft] = useState('1')
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignForm, setAssignForm] = useState({ classId: '', opensAt: '', closesAt: '' })

  const { data: exam } = useQuery({ queryKey: ['teacher', 'exams', examId], queryFn: () => getExam(examId) })
  const { data: examQuestions, refetch: refetchExamQuestions } = useQuery({
    queryKey: ['teacher', 'exams', examId, 'questions'],
    queryFn: () => listExamQuestions(examId),
  })
  const { data: bank } = useQuery({ queryKey: ['teacher', 'questions', 'picker'], queryFn: () => listQuestions() })
  const { data: classes } = useQuery({ queryKey: ['admin', 'classes'], queryFn: () => listClasses() })
  const { data: examClasses, refetch: refetchExamClasses } = useQuery({
    queryKey: ['teacher', 'exams', examId, 'classes'],
    queryFn: () => listExamClasses(examId),
    enabled: exam?.status === 'published',
  })

  const isDraft = exam?.status === 'draft'
  const alreadyAddedIds = new Set(examQuestions?.map((eq) => eq.questionId))

  const addQuestionMutation = useMutation({
    mutationFn: (questionId: number) => addExamQuestion(examId, questionId, Number(scoreDraft)),
    onSuccess: () => {
      refetchExamQuestions()
      setPickerOpen(false)
    },
    onError: () => toast.error('Không thể thêm câu hỏi'),
  })

  const removeQuestionMutation = useMutation({
    mutationFn: (examQuestionId: number) => removeExamQuestion(examId, examQuestionId),
    onSuccess: () => refetchExamQuestions(),
  })

  const publishMutation = useMutation({
    mutationFn: () => publishExam(examId),
    onSuccess: () => {
      toast.success('Đã xuất bản đề thi')
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exams', examId] })
    },
    onError: () => toast.error('Không thể xuất bản (đề cần ít nhất 1 câu hỏi)'),
  })

  const assignMutation = useMutation({
    mutationFn: () =>
      assignExamClass(examId, {
        classId: Number(assignForm.classId),
        opensAt: new Date(assignForm.opensAt).toISOString(),
        closesAt: new Date(assignForm.closesAt).toISOString(),
      }),
    onSuccess: () => {
      toast.success('Đã gán lớp')
      setAssignOpen(false)
      refetchExamClasses()
    },
    onError: () => toast.error('Không thể gán lớp (kiểm tra bạn có phụ trách lớp này không)'),
  })

  if (!exam) return null

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {exam.durationMinutes} phút · {exam.totalScore} điểm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
            {exam.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
          </Badge>
          {isDraft && (
            <Button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
              Xuất bản
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Câu hỏi trong đề ({examQuestions?.length ?? 0})</h2>
        {isDraft && (
          <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Thêm câu hỏi</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chọn câu hỏi từ ngân hàng</DialogTitle>
              </DialogHeader>
              <div className="mb-3 flex items-center gap-2">
                <Label>Điểm mỗi câu chọn tiếp theo</Label>
                <Input
                  type="number"
                  step="0.25"
                  className="w-24"
                  value={scoreDraft}
                  onChange={(e) => setScoreDraft(e.target.value)}
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableBody>
                    {bank?.data
                      .filter((q) => !alreadyAddedIds.has(q.id))
                      .map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="max-w-md">{q.content}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => addQuestionMutation.mutate(q.id)}
                              disabled={addQuestionMutation.isPending}
                            >
                              Thêm
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead>Điểm</TableHead>
            {isDraft && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {examQuestions?.map((eq, index) => (
            <TableRow key={eq.examQuestionId}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="max-w-md">{eq.question?.content}</TableCell>
              <TableCell>{eq.score}</TableCell>
              {isDraft && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestionMutation.mutate(eq.examQuestionId)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {exam.status === 'published' && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Lớp được gán</h2>
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Gán lớp</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gán đề thi cho lớp</DialogTitle>
                </DialogHeader>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    assignMutation.mutate()
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <Label>Lớp</Label>
                    <Select value={assignForm.classId} onValueChange={(v) => setAssignForm((f) => ({ ...f, classId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.data.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Mở lúc</Label>
                    <Input
                      type="datetime-local"
                      value={assignForm.opensAt}
                      onChange={(e) => setAssignForm((f) => ({ ...f, opensAt: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Đóng lúc</Label>
                    <Input
                      type="datetime-local"
                      value={assignForm.closesAt}
                      onChange={(e) => setAssignForm((f) => ({ ...f, closesAt: e.target.value }))}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={assignMutation.isPending || !assignForm.classId}>
                      Gán
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lớp</TableHead>
                <TableHead>Mở lúc</TableHead>
                <TableHead>Đóng lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examClasses?.map((ec) => (
                <TableRow key={ec.id}>
                  <TableCell>{ec.className}</TableCell>
                  <TableCell>{new Date(ec.opensAt).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{new Date(ec.closesAt).toLocaleString('vi-VN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
