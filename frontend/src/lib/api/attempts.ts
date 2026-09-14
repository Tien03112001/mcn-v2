import apiClient from '@/lib/api-client'
import type {
  AnswerPayload,
  AttemptDetail,
  AttemptHistoryItem,
  AttemptResult,
  AttemptStartResponse,
  ViolationReportResult,
} from '@/types/attempt'
import type { StudentExamListItem } from '@/types/exam'

export async function listStudentExams(status?: 'upcoming' | 'open' | 'closed') {
  const { data } = await apiClient.get<{ data: StudentExamListItem[] }>('/student/exams', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function startAttempt(examClassId: number) {
  const { data } = await apiClient.post<{ data: AttemptStartResponse }>(`/student/exams/${examClassId}/attempts`)
  return data.data
}

export async function getAttempt(attemptId: number) {
  const { data } = await apiClient.get<{ data: AttemptDetail }>(`/student/attempts/${attemptId}`)
  return data.data
}

export async function saveAnswer(attemptId: number, questionId: number, payload: AnswerPayload) {
  await apiClient.put(`/student/attempts/${attemptId}/answers/${questionId}`, payload)
}

export async function reportViolation(
  attemptId: number,
  violationType: 'tab_hidden' | 'window_blur' = 'tab_hidden'
) {
  const { data } = await apiClient.post<{ data: ViolationReportResult }>(`/student/attempts/${attemptId}/violations`, {
    violationType,
    clientReportedAt: new Date().toISOString(),
  })
  return data.data
}

export async function submitAttempt(attemptId: number) {
  const { data } = await apiClient.post<{ data: { attemptId: number; status: string; score: number | null } }>(
    `/student/attempts/${attemptId}/submit`
  )
  return data.data
}

export async function getAttemptResult(attemptId: number) {
  const { data } = await apiClient.get<{ data: AttemptResult }>(`/student/attempts/${attemptId}/result`)
  return data.data
}

export async function listAttemptHistory() {
  const { data } = await apiClient.get<{ data: AttemptHistoryItem[] }>('/student/attempts')
  return data.data
}
