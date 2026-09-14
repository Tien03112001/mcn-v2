import apiClient from '@/lib/api-client'
import type { PaginatedResponse } from '@/lib/api/admin'
import type { Exam, ExamClassAssignment, ExamQuestionSummary } from '@/types/exam'

export async function listExams() {
  const { data } = await apiClient.get<PaginatedResponse<Exam>>('/teacher/exams')
  return data
}

export async function getExam(id: number) {
  const { data } = await apiClient.get<{ data: Exam }>(`/teacher/exams/${id}`)
  return data.data
}

export async function createExam(payload: {
  subjectId: number
  title: string
  description?: string
  durationMinutes: number
  totalScore?: number
  maxViolationCount?: number
  tagIds?: number[]
}) {
  const { data } = await apiClient.post<{ data: Exam }>('/teacher/exams', payload)
  return data.data
}

export async function updateExam(id: number, payload: Partial<{ title: string; description: string; durationMinutes: number; totalScore: number; tagIds: number[] }>) {
  const { data } = await apiClient.patch<{ data: Exam }>(`/teacher/exams/${id}`, payload)
  return data.data
}

export async function publishExam(id: number) {
  const { data } = await apiClient.post<{ data: Exam }>(`/teacher/exams/${id}/publish`)
  return data.data
}

export async function listExamQuestions(examId: number) {
  const { data } = await apiClient.get<{ data: ExamQuestionSummary[] }>(`/teacher/exams/${examId}/questions`)
  return data.data
}

export async function addExamQuestion(examId: number, questionId: number, score: number) {
  const { data } = await apiClient.post<{ data: ExamQuestionSummary }>(`/teacher/exams/${examId}/questions`, {
    questionId,
    score,
  })
  return data.data
}

export async function removeExamQuestion(examId: number, examQuestionId: number) {
  await apiClient.delete(`/teacher/exams/${examId}/questions/${examQuestionId}`)
}

export async function listExamClasses(examId: number) {
  const { data } = await apiClient.get<{ data: ExamClassAssignment[] }>(`/teacher/exams/${examId}/classes`)
  return data.data
}

export async function assignExamClass(examId: number, payload: { classId: number; opensAt: string; closesAt: string }) {
  const { data } = await apiClient.post<{ data: ExamClassAssignment }>(`/teacher/exams/${examId}/classes`, payload)
  return data.data
}

export interface ExamAttemptSummary {
  attemptId: number
  studentId: number
  studentName: string
  className: string
  status: string
  score: number | null
  violationCount: number
  isFlagged: boolean
  startedAt: string
  submittedAt: string | null
}

export async function listExamAttempts(examId: number) {
  const { data } = await apiClient.get<{ data: ExamAttemptSummary[] }>(`/teacher/exams/${examId}/attempts`)
  return data.data
}

export interface AttemptDetailForTeacher {
  attemptId: number
  studentName: string
  status: string
  score: number | null
  violationCount: number
  isFlagged: boolean
  startedAt: string
  submittedAt: string | null
  answers: {
    questionId: number
    content: string
    questionType: string
    answerPayload: unknown
    isCorrect: boolean | null
    scoreAwarded: number | null
  }[]
}

export async function getAttemptDetail(attemptId: number) {
  const { data } = await apiClient.get<{ data: AttemptDetailForTeacher }>(`/teacher/attempts/${attemptId}`)
  return data.data
}

export interface ViolationEntry {
  id: number
  violationType: string
  occurredAt: string
  clientReportedAt: string | null
}

export async function getAttemptViolations(attemptId: number) {
  const { data } = await apiClient.get<{ data: ViolationEntry[] }>(`/teacher/attempts/${attemptId}/violations`)
  return data.data
}
