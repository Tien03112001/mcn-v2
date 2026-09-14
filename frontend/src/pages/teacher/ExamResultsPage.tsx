import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getExam, listExamAttempts } from '@/lib/api/exams'

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'Đang làm bài',
  submitted: 'Đã nộp',
  auto_submitted: 'Tự động nộp (vi phạm)',
  expired: 'Hết giờ',
}

export default function ExamResultsPage() {
  const { id } = useParams<{ id: string }>()
  const examId = Number(id)

  const { data: exam } = useQuery({ queryKey: ['teacher', 'exams', examId], queryFn: () => getExam(examId) })
  const { data: attempts, isLoading } = useQuery({
    queryKey: ['teacher', 'exams', examId, 'attempts'],
    queryFn: () => listExamAttempts(examId),
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Kết quả — {exam?.title}</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sinh viên</TableHead>
            <TableHead>Lớp</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Điểm</TableHead>
            <TableHead>Vi phạm</TableHead>
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
          {attempts?.map((a) => (
            <TableRow key={a.attemptId}>
              <TableCell>{a.studentName}</TableCell>
              <TableCell>{a.className}</TableCell>
              <TableCell>{STATUS_LABEL[a.status] ?? a.status}</TableCell>
              <TableCell>{a.score ?? '—'}</TableCell>
              <TableCell>
                {a.isFlagged ? (
                  <Badge variant="destructive">{a.violationCount} lần (nghi vấn)</Badge>
                ) : (
                  a.violationCount
                )}
              </TableCell>
              <TableCell>
                <Link to={`/teacher/attempts/${a.attemptId}`} className="text-sm text-primary hover:underline">
                  Xem chi tiết
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
