import apiClient from '@/lib/api-client'
import type { PaginatedResponse } from '@/lib/api/admin'
import type { Exam, ExamRoomAssignment, ExamQuestionSummary } from '@/types/exam'
import type { User } from '@/types/user'

export interface TeacherDashboardStats {
  questions: { total: number; easy: number; medium: number; hard: number }
  exams: { total: number; draft: number; published: number; archived: number }
  examRooms: { total: number }
  attempts: {
    total: number
    inProgress: number
    submitted: number
    autoSubmitted: number
    expired: number
    last7Days: number
    averageScore: number | null
    flagged: number
  }
  trend: { date: string; total: number }[]
  upcomingExamRooms: {
    id: number
    examId: number
    examTitle: string
    roomName: string
    opensAt: string
    closesAt: string
  }[]
  recentAttempts: {
    id: number
    studentName: string
    examTitle: string
    roomName: string
    status: string
    score: number | null
    submittedAt: string | null
  }[]
}

export async function getTeacherDashboardStats() {
  const { data } = await apiClient.get<{ data: TeacherDashboardStats }>('/teacher/dashboard')
  return data.data
}

export async function listExams(params?: { page?: number; perPage?: number }) {
  const { data } = await apiClient.get<PaginatedResponse<Exam>>('/teacher/exams', { params })
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

export async function deleteExam(id: number) {
  await apiClient.delete(`/teacher/exams/${id}`)
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

export async function listExamRooms(examId: number) {
  const { data } = await apiClient.get<{ data: ExamRoomAssignment[] }>(`/teacher/exams/${examId}/rooms`)
  return data.data
}

export async function createExamRoom(examId: number, payload: { name: string; opensAt: string; closesAt: string }) {
  const { data } = await apiClient.post<{ data: ExamRoomAssignment }>(`/teacher/exams/${examId}/rooms`, payload)
  return data.data
}

export async function updateExamRoom(
  examId: number,
  roomId: number,
  payload: Partial<{ name: string; opensAt: string; closesAt: string }>
) {
  const { data } = await apiClient.patch<{ data: ExamRoomAssignment }>(`/teacher/exams/${examId}/rooms/${roomId}`, payload)
  return data.data
}

export async function deleteExamRoom(examId: number, roomId: number) {
  await apiClient.delete(`/teacher/exams/${examId}/rooms/${roomId}`)
}

export async function listExamRoomStudents(
  examId: number,
  roomId: number,
  params?: { page?: number; perPage?: number }
) {
  const { data } = await apiClient.get<PaginatedResponse<User>>(
    `/teacher/exams/${examId}/rooms/${roomId}/students`,
    { params }
  )
  return data
}

export async function addExamRoomStudent(examId: number, roomId: number, studentId: number) {
  const { data } = await apiClient.post<{ data: User }>(`/teacher/exams/${examId}/rooms/${roomId}/students`, {
    studentId,
  })
  return data.data
}

export async function removeExamRoomStudent(examId: number, roomId: number, studentId: number) {
  await apiClient.delete(`/teacher/exams/${examId}/rooms/${roomId}/students/${studentId}`)
}

export async function importExamRoomStudents(examId: number, roomId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<{ data: { enrolled: number; created: number; skipped: string[] } }>(
    `/teacher/exams/${examId}/rooms/${roomId}/students/import`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data.data
}

export interface ExamAttemptSummary {
  attemptId: number
  studentId: number
  studentName: string
  roomName: string
  status: string
  score: number | null
  violationCount: number
  isFlagged: boolean
  startedAt: string
  submittedAt: string | null
}

export async function listExamAttempts(examId: number, params?: { page?: number; perPage?: number }) {
  const { data } = await apiClient.get<PaginatedResponse<ExamAttemptSummary>>(
    `/teacher/exams/${examId}/attempts`,
    { params }
  )
  return data
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
