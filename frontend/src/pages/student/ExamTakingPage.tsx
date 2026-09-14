import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import ExamTakingLayout from '@/components/layout/ExamTakingLayout'
import ExamTimer from '@/components/exam/ExamTimer'
import QuestionNavigator from '@/components/exam/QuestionNavigator'
import ViolationWarningDialog from '@/components/exam/ViolationWarningDialog'
import QuestionRenderer from '@/components/question-types/QuestionRenderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useExamProctoring } from '@/hooks/use-exam-proctoring'
import { saveAnswer, startAttempt, submitAttempt } from '@/lib/api/attempts'
import type { AnswerPayload } from '@/types/attempt'

const AUTOSAVE_DEBOUNCE_MS = 400

export default function ExamTakingPage() {
  const { examClassId } = useParams<{ examClassId: string }>()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, AnswerPayload>>({})
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const startMutation = useMutation({
    mutationFn: () => startAttempt(Number(examClassId)),
    onError: (error: unknown) => {
      const code = (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
      toast.error(code === 'ATTEMPT_ALREADY_EXISTS' ? 'Bạn đã làm bài thi này rồi' : 'Không thể bắt đầu làm bài')
      navigate('/student')
    },
  })

  // Start exactly once on mount.
  const hasStarted = useRef(false)
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    startMutation.mutate()
  }, [startMutation])

  const attemptId = startMutation.data?.attemptId
  const questions = startMutation.data?.questions ?? []

  const submitMutation = useMutation({
    mutationFn: () => submitAttempt(attemptId!),
    onSuccess: (result) => {
      navigate(`/student/attempts/${result.attemptId}/result`, { replace: true })
    },
  })

  const handleAutoSubmit = useCallback(() => {
    toast.warning('Bài thi đã được tự động nộp do vi phạm giám sát vượt quá số lần cho phép.')
    if (attemptId) {
      navigate(`/student/attempts/${attemptId}/result`, { replace: true })
    }
  }, [attemptId, navigate])

  const proctoring = useExamProctoring({
    attemptId: attemptId ?? 0,
    enabled: Boolean(attemptId) && !submitMutation.isSuccess,
    onAutoSubmit: handleAutoSubmit,
  })

  function handleAnswerChange(questionId: number, payload: AnswerPayload) {
    setAnswers((prev) => ({ ...prev, [questionId]: payload }))

    clearTimeout(debounceTimers.current[questionId])
    debounceTimers.current[questionId] = setTimeout(() => {
      if (attemptId) {
        saveAnswer(attemptId, questionId, payload).catch(() => {
          toast.error('Không thể lưu câu trả lời, vui lòng thử lại')
        })
      }
    }, AUTOSAVE_DEBOUNCE_MS)
  }

  if (startMutation.isPending || !attemptId) {
    return (
      <ExamTakingLayout headerRight={null}>
        <p className="text-muted-foreground">Đang tải đề thi...</p>
      </ExamTakingLayout>
    )
  }

  const currentQuestion = questions[currentIndex]
  const answeredIndexes = new Set(
    questions.map((q, i) => (answers[q.questionId] !== undefined ? i : -1)).filter((i) => i >= 0)
  )

  return (
    <ExamTakingLayout
      headerRight={
        <ExamTimer deadlineAt={startMutation.data!.deadlineAt} onExpire={() => submitMutation.mutate()} />
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_200px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal">
              Câu {currentIndex + 1}/{questions.length} ({currentQuestion.score} điểm)
              <p className="mt-2 text-base font-medium text-foreground">{currentQuestion.content}</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionRenderer
              question={currentQuestion}
              value={answers[currentQuestion.questionId] ?? currentQuestion.savedAnswer}
              onChange={(payload) => handleAnswerChange(currentQuestion.questionId, payload)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <QuestionNavigator
            totalQuestions={questions.length}
            answeredIndexes={answeredIndexes}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
          />

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Sau
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full">Nộp bài</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận nộp bài?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn đã trả lời {answeredIndexes.size}/{questions.length} câu. Sau khi nộp, bạn không thể sửa bài
                  làm nữa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                  Nộp bài
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <ViolationWarningDialog
        open={proctoring.showWarning}
        violationCount={proctoring.violationCount}
        maxViolationCount={proctoring.maxViolationCount ?? 0}
        onDismiss={proctoring.dismissWarning}
      />
    </ExamTakingLayout>
  )
}
