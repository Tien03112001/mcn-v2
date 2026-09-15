import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  School,
  BookOpen,
  FileQuestion,
  ClipboardList,
  Activity,
  ShieldAlert,
  CalendarClock,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDashboardStats } from '@/lib/api/admin'

const ATTEMPT_STATUS_LABEL: Record<string, string> = {
  in_progress: 'Đang làm bài',
  submitted: 'Đã nộp',
  auto_submitted: 'Tự động nộp',
  expired: 'Hết hạn',
}

const ATTEMPT_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  in_progress: 'default',
  submitted: 'secondary',
  auto_submitted: 'outline',
  expired: 'destructive',
}

function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  hint?: string
  to?: string
}

function StatCard({ icon: Icon, label, value, hint, to }: StatCardProps) {
  const content = (
    <CardContent className="flex h-full items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{hint ?? ' '}</span>
      </div>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </div>
    </CardContent>
  )

  if (!to) {
    return <Card className="h-full">{content}</Card>
  }

  return (
    <Link
      to={to}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">{content}</Card>
    </Link>
  )
}

function BreakdownRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value} <span className="text-xs text-muted-foreground">({pct}%)</span>
        </span>
      </div>
      <Progress value={pct} />
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboardStats,
  })

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Tổng quan</h1>
          <p className="mt-1 text-muted-foreground">Chào mừng đến trang quản trị hệ thống.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const maxTrend = Math.max(1, ...data.trend.map((t) => t.total))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <p className="mt-1 text-muted-foreground">Chào mừng đến trang quản trị hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label="Người dùng"
          value={data.users.total}
          hint={`${data.users.active} đang hoạt động · +${data.users.newLast30Days} trong 30 ngày`}
          to="/admin/users"
        />
        <StatCard icon={School} label="Lớp học" value={data.classes.total} to="/admin/classes" />
        <StatCard icon={BookOpen} label="Môn học" value={data.subjects.total} to="/admin/subjects" />
        <StatCard
          icon={FileQuestion}
          label="Câu hỏi trong ngân hàng đề"
          value={data.questions.total}
          to="/teacher/questions"
        />
        <StatCard
          icon={ClipboardList}
          label="Đề thi"
          value={data.exams.total}
          hint={`${data.exams.published} đã xuất bản · ${data.exams.draft} nháp`}
          to="/teacher/exams"
        />
        <StatCard
          icon={Activity}
          label="Lượt làm bài"
          value={data.attempts.total}
          hint={`${data.attempts.last7Days} trong 7 ngày qua`}
          to="/teacher/exams"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-muted-foreground" />
              Lượt làm bài 7 ngày gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.trend.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
            ) : (
              <div className="flex h-40 items-end gap-3">
                {data.trend.map((point) => (
                  <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{point.total}</span>
                    <div
                      className="w-full rounded-t-md bg-primary/80"
                      style={{ height: `${Math.max(4, (point.total / maxTrend) * 100)}%` }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(point.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Điểm số &amp; giám sát</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
              <span className="text-sm text-muted-foreground">Điểm trung bình</span>
              <span className="text-lg font-semibold">
                {data.attempts.averageScore !== null ? data.attempts.averageScore.toFixed(1) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShieldAlert className="size-3.5" />
                Lượt bài bị gắn cờ vi phạm
              </span>
              <Badge variant={data.attempts.flagged > 0 ? 'destructive' : 'secondary'}>
                {data.attempts.flagged}
              </Badge>
            </div>
            <div className="flex flex-col gap-3 pt-1">
              {(['in_progress', 'submitted', 'auto_submitted', 'expired'] as const).map((status) => (
                <BreakdownRow
                  key={status}
                  label={ATTEMPT_STATUS_LABEL[status]}
                  value={
                    {
                      in_progress: data.attempts.inProgress,
                      submitted: data.attempts.submitted,
                      auto_submitted: data.attempts.autoSubmitted,
                      expired: data.attempts.expired,
                    }[status]
                  }
                  total={data.attempts.total}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Lượt làm bài gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có lượt làm bài nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học viên</TableHead>
                    <TableHead>Đề thi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Điểm</TableHead>
                    <TableHead className="text-right">Nộp lúc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentAttempts.map((attempt) => (
                    <TableRow
                      key={attempt.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/teacher/attempts/${attempt.id}`)}
                    >
                      <TableCell className="font-medium">{attempt.studentName}</TableCell>
                      <TableCell className="text-muted-foreground">{attempt.examTitle}</TableCell>
                      <TableCell>
                        <Badge variant={ATTEMPT_STATUS_VARIANT[attempt.status] ?? 'outline'}>
                          {ATTEMPT_STATUS_LABEL[attempt.status] ?? attempt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{attempt.score ?? '—'}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDateTime(attempt.submittedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4 text-muted-foreground" />
              Kỳ thi sắp mở
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.upcomingExamClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có kỳ thi nào sắp mở.</p>
            ) : (
              data.upcomingExamClasses.map((item) => (
                <Link
                  key={item.id}
                  to={`/teacher/exams/${item.examId}`}
                  className="block rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <p className="text-sm font-medium">{item.examTitle}</p>
                  <p className="text-xs text-muted-foreground">Lớp {item.className}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mở lúc {formatDateTime(item.opensAt)} · Đóng lúc {formatDateTime(item.closesAt)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
