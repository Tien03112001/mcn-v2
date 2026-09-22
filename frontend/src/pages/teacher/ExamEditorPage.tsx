import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { listQuestions } from '@/lib/api/questions'
import {
  addExamQuestion,
  createExamRoom,
  getExam,
  listExamRooms,
  listExamQuestions,
  publishExam,
  removeExamQuestion,
} from '@/lib/api/exams'

const CREATE_ROOM_ERROR_MESSAGE: Record<string, string> = {
  EXAM_NOT_PUBLISHED: 'Đề thi chưa được xuất bản.',
  INVALID_SCHEDULE: 'Thời gian đóng phải sau thời gian mở.',
  EXAM_NOT_FOUND: 'Không tìm thấy đề thi.',
  ROOM_HAS_ATTEMPTS: 'Phòng thi đã có học viên làm bài, không thể xoá.',
}

function getCreateRoomErrorMessage(error: unknown): string {
  if (isAxiosError<{ error?: { code?: string } }>(error)) {
    const code = error.response?.data?.error?.code
    if (code && CREATE_ROOM_ERROR_MESSAGE[code]) {
      return CREATE_ROOM_ERROR_MESSAGE[code]
    }
  }
  return 'Không thể tạo phòng thi. Vui lòng thử lại.'
}

export default function ExamEditorPage() {
  const { id } = useParams<{ id: string }>()
  const examId = Number(id)
  const queryClient = useQueryClient()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [scoreDraft, setScoreDraft] = useState('1')
  const [assignOpen, setAssignOpen] = useState(false)
  const [roomForm, setRoomForm] = useState({ name: '', opensAt: '', closesAt: '' })

  const { data: exam } = useQuery({ queryKey: ['teacher', 'exams', examId], queryFn: () => getExam(examId) })
  const { data: examQuestions, refetch: refetchExamQuestions } = useQuery({
    queryKey: ['teacher', 'exams', examId, 'questions'],
    queryFn: () => listExamQuestions(examId),
  })
  const { data: bank } = useQuery({ queryKey: ['teacher', 'questions', 'picker'], queryFn: () => listQuestions() })
  const { data: examRooms, refetch: refetchExamRooms } = useQuery({
    queryKey: ['teacher', 'exams', examId, 'rooms'],
    queryFn: () => listExamRooms(examId),
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

  const createRoomMutation = useMutation({
    mutationFn: () =>
      createExamRoom(examId, {
        name: roomForm.name,
        opensAt: new Date(roomForm.opensAt).toISOString(),
        closesAt: new Date(roomForm.closesAt).toISOString(),
      }),
    onSuccess: () => {
      toast.success('Đã tạo phòng thi')
      setAssignOpen(false)
      setRoomForm({ name: '', opensAt: '', closesAt: '' })
      refetchExamRooms()
    },
    onError: (error) => toast.error(getCreateRoomErrorMessage(error)),
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
            <h2 className="text-lg font-medium">Phòng thi</h2>
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Tạo phòng thi</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo phòng thi cho đề</DialogTitle>
                </DialogHeader>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    createRoomMutation.mutate()
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <Label>Tên phòng thi</Label>
                    <Input
                      placeholder="VD: Phòng A1, Ca sáng..."
                      value={roomForm.name}
                      onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Mở lúc</Label>
                    <Input
                      type="datetime-local"
                      value={roomForm.opensAt}
                      onChange={(e) => setRoomForm((f) => ({ ...f, opensAt: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Đóng lúc</Label>
                    <Input
                      type="datetime-local"
                      value={roomForm.closesAt}
                      onChange={(e) => setRoomForm((f) => ({ ...f, closesAt: e.target.value }))}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createRoomMutation.isPending || !roomForm.name}>
                      Tạo phòng thi
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên phòng</TableHead>
                <TableHead>Mở lúc</TableHead>
                <TableHead>Đóng lúc</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {examRooms?.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{new Date(room.opensAt).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{new Date(room.closesAt).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>
                    <Link
                      to={`/teacher/exams/${examId}/rooms/${room.id}`}
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Chi tiết
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
