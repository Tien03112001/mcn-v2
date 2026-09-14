import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAttemptDetail, getAttemptViolations } from '@/lib/api/exams'

export default function AttemptDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const id = Number(attemptId)

  const { data: attempt } = useQuery({ queryKey: ['teacher', 'attempts', id], queryFn: () => getAttemptDetail(id) })
  const { data: violations } = useQuery({
    queryKey: ['teacher', 'attempts', id, 'violations'],
    queryFn: () => getAttemptViolations(id),
  })

  if (!attempt) return null

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{attempt.studentName}</h1>
        <div className="flex items-center gap-2">
          {attempt.isFlagged && <Badge variant="destructive">Nghi vấn gian lận</Badge>}
          <span className="text-lg font-medium">Điểm: {attempt.score ?? '—'}</span>
        </div>
      </div>

      {violations && violations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Log vi phạm giám sát ({violations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {violations.map((v) => (
                <li key={v.id}>
                  {v.violationType === 'tab_hidden' ? 'Rời khỏi tab' : 'Mất focus cửa sổ'} —{' '}
                  {new Date(v.occurredAt).toLocaleString('vi-VN')}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {attempt.answers.map((answer, index) => (
          <Card key={answer.questionId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base font-normal">
                <span>
                  Câu {index + 1}: {answer.content}
                </span>
                <Badge variant={answer.isCorrect ? 'default' : 'destructive'}>
                  {answer.scoreAwarded ?? 0} điểm
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
