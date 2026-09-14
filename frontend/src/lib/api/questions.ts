import apiClient from '@/lib/api-client'
import type { PaginatedResponse } from '@/lib/api/admin'
import type { AnswerConfig, Question, QuestionDifficulty, QuestionType } from '@/types/question'

export interface QuestionFilters {
  subjectId?: number
  topicId?: number
  difficulty?: QuestionDifficulty
  type?: QuestionType
  keyword?: string
  page?: number
}

export async function listQuestions(filters?: QuestionFilters) {
  const { data } = await apiClient.get<PaginatedResponse<Question>>('/teacher/questions', { params: filters })
  return data
}

export async function getQuestion(id: number) {
  const { data } = await apiClient.get<{ data: Question }>(`/teacher/questions/${id}`)
  return data.data
}

export interface QuestionOptionInput {
  label: string
  content: string
  isCorrect: boolean
}

export interface QuestionPartInput {
  label: string
  content: string
  isCorrect: boolean
}

export interface CreateQuestionPayload {
  subjectId: number
  topicId?: number
  questionType: QuestionType
  difficulty: QuestionDifficulty
  content: string
  explanation?: string
  answerConfig?: AnswerConfig
  options?: QuestionOptionInput[]
  parts?: QuestionPartInput[]
}

export async function createQuestion(payload: CreateQuestionPayload) {
  const { data } = await apiClient.post<{ data: Question }>('/teacher/questions', payload)
  return data.data
}

export async function updateQuestion(id: number, payload: Partial<CreateQuestionPayload>) {
  const { data } = await apiClient.patch<{ data: Question }>(`/teacher/questions/${id}`, payload)
  return data.data
}

export async function deleteQuestion(id: number) {
  await apiClient.delete(`/teacher/questions/${id}`)
}
