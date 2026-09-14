import type { QuestionType } from '@/types/question'

export type ExamAttemptStatus = 'in_progress' | 'submitted' | 'auto_submitted' | 'expired'

export type AnswerPayload =
  | { selectedOptionId: number | null }
  | { selectedOptionIds: number[] }
  | { answers: Record<string, boolean> }
  | { rawValue: string | null }

export interface AttemptQuestion {
  questionId: number
  orderIndex: number
  score: number
  questionType: QuestionType
  content: string
  options: { id: number; label: string; content: string }[]
  parts: { label: string; content: string }[]
  savedAnswer?: AnswerPayload | null
}

export interface AttemptStartResponse {
  attemptId: number
  startedAt: string
  deadlineAt: string
  questions: AttemptQuestion[]
}

export interface AttemptDetail {
  attemptId: number
  status: ExamAttemptStatus
  startedAt: string
  deadlineAt: string
  violationCount: number
  questions: AttemptQuestion[]
}

export interface ViolationReportResult {
  violationCount: number
  maxViolationCount: number
  autoSubmitted: boolean
}

export interface AttemptResult {
  attemptId: number
  status: ExamAttemptStatus
  score: number | null
  submittedAt: string | null
  isFlagged: boolean
  violationCount: number
  answers: {
    questionId: number
    content: string
    questionType: QuestionType
    explanation: string | null
    answerPayload: AnswerPayload
    isCorrect: boolean | null
    scoreAwarded: number | null
  }[]
}

export interface AttemptHistoryItem {
  attemptId: number
  examTitle: string
  status: ExamAttemptStatus
  score: number | null
  startedAt: string
  submittedAt: string | null
  isFlagged: boolean
}
