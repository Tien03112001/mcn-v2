import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { listStudentExams } from '@/lib/api/attempts'

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'Đang làm',
  submitted: 'Đã nộp',
  auto_submitted: 'Tự động nộp',
  expired: 'Hết giờ',
}

export default function ExamListPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'open' | 'upcoming' | 'closed'>('open')

  const { data: exams, isLoading } = useQuery({
    queryKey: ['student', 'exams', tab],
    queryFn: () => listStudentExams(tab),
  })

  function handleStart(examClassId: number) {
    navigate(`/student/exams/${examClassId}/take`)
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Đề thi của tôi</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-6">
        <TabsList>
          <TabsTrigger value="open">Đang mở</TabsTrigger>
          <TabsTrigger value="upcoming">Sắp thi</TabsTrigger>
          <TabsTrigger value="closed">Đã đóng</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && <p className="text-muted-foreground">Đang tải...</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams?.map((exam) => (
          <Card key={exam.examClassId}>
            <CardHeader>
              <CardTitle className="text-base">{exam.title}</CardTitle>
              <div className="flex flex-wrap gap-1 pt-1">
                {exam.tags.map((t) => (
                  <Badge key={t.id} variant="secondary">
                    {t.name}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {exam.durationMinutes} phút · {exam.totalScore} điểm
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Đóng lúc: {new Date(exam.closesAt).toLocaleString('vi-VN')}
              </p>
              <div className="mt-4">
                {exam.attemptStatus ? (
                  <Badge variant="outline">{STATUS_LABEL[exam.attemptStatus] ?? exam.attemptStatus}</Badge>
                ) : tab === 'open' ? (
                  <Button size="sm" onClick={() => handleStart(exam.examClassId)}>
                    Vào thi
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Chưa đến giờ làm bài</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && exams?.length === 0 && (
        <p className="text-muted-foreground">Không có đề thi nào ở mục này.</p>
      )}
    </div>
  )
}
