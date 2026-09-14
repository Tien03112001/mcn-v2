import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAttemptResult } from '@/lib/api/attempts'

export default function ExamResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const id = Number(attemptId)

  const { data: result } = useQuery({
    queryKey: ['student', 'attempts', id, 'result'],
    queryFn: () => getAttemptResult(id),
  })

  if (!result) return null

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kết quả bài thi</h1>
        <div className="text-right">
          <p className="text-3xl font-bold">{result.score ?? '—'}</p>
          {result.isFlagged && <Badge variant="destructive">Nghi vấn gian lận</Badge>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {result.answers.map((answer, index) => (
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
            {answer.explanation && (
              <CardContent className="text-sm text-muted-foreground">
                <strong>Lời giải:</strong> {answer.explanation}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
