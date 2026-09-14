import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { listAttemptHistory } from '@/lib/api/attempts'

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'Đang làm',
  submitted: 'Đã nộp',
  auto_submitted: 'Tự động nộp (vi phạm)',
  expired: 'Hết giờ',
}

export default function AttemptHistoryPage() {
  const { data: attempts, isLoading } = useQuery({
    queryKey: ['student', 'attempts', 'history'],
    queryFn: listAttemptHistory,
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Lịch sử làm bài</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Đề thi</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Điểm</TableHead>
            <TableHead>Nộp lúc</TableHead>
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
          {attempts?.map((a) => (
            <TableRow key={a.attemptId}>
              <TableCell>
                <Link to={`/student/attempts/${a.attemptId}/result`} className="hover:underline">
                  {a.examTitle}
                </Link>
              </TableCell>
              <TableCell>
                {a.isFlagged ? (
                  <Badge variant="destructive">Nghi vấn gian lận</Badge>
                ) : (
                  (STATUS_LABEL[a.status] ?? a.status)
                )}
              </TableCell>
              <TableCell>{a.score ?? '—'}</TableCell>
              <TableCell>{a.submittedAt ? new Date(a.submittedAt).toLocaleString('vi-VN') : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
