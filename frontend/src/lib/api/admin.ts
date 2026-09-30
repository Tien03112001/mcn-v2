import apiClient from '@/lib/api-client'
import type { User, UserRole } from '@/types/user'

export interface PaginatedResponse<T> {
  data: T[]
  metadata: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export interface Subject {
  id: number
  code: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string | null
}

export interface Topic {
  id: number
  subjectId: number
  name: string
  orderIndex: number
}

export interface Tag {
  id: number
  name: string
  slug: string
}

// Dashboard
export interface DashboardStats {
  users: {
    total: number
    admin: number
    teacher: number
    student: number
    active: number
    newLast30Days: number
  }
  examRooms: { total: number }
  subjects: { total: number }
  questions: { total: number; easy: number; medium: number; hard: number }
  exams: { total: number; draft: number; published: number; archived: number }
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
    status: string
    score: number | null
    submittedAt: string | null
  }[]
}

export async function getDashboardStats() {
  const { data } = await apiClient.get<{ data: DashboardStats }>('/admin/dashboard')
  return data.data
}

// Users
export async function listUsers(params?: { role?: UserRole; page?: number; perPage?: number }) {
  const { data } = await apiClient.get<PaginatedResponse<User>>('/admin/users', { params })
  return data
}

export async function createUser(payload: {
  fullName: string
  email: string
  password: string
  role: UserRole
  studentCode?: string
}) {
  const { data } = await apiClient.post<{ data: User }>('/admin/users', payload)
  return data.data
}

export async function updateUser(
  id: number,
  payload: Partial<{ fullName: string; email: string; role: UserRole; studentCode: string; isActive: boolean }>
) {
  const { data } = await apiClient.patch<{ data: User }>(`/admin/users/${id}`, payload)
  return data.data
}

export async function deactivateUser(id: number) {
  await apiClient.delete(`/admin/users/${id}`)
}

export async function resetUserPassword(id: number, password: string) {
  await apiClient.post(`/admin/users/${id}/reset-password`, { password })
}

export async function importUsers(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<{ data: { created: number; skipped: string[] } }>(
    '/admin/users/import',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data.data
}

export async function downloadUserTemplate() {
  const response = await apiClient.get('/admin/users/template', { responseType: 'blob' })
  const url = URL.createObjectURL(response.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'mau_nhap_nguoi_dung.xlsx'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Subjects & topics
export async function listSubjects() {
  const { data } = await apiClient.get<{ data: Subject[] }>('/admin/subjects')
  return data.data
}

export async function createSubject(payload: { code: string; name: string; description?: string }) {
  const { data } = await apiClient.post<{ data: Subject }>('/admin/subjects', payload)
  return data.data
}

export async function updateSubject(
  id: number,
  payload: Partial<{ code: string; name: string; description: string }>
) {
  const { data } = await apiClient.patch<{ data: Subject }>(`/admin/subjects/${id}`, payload)
  return data.data
}

export async function deleteSubject(id: number) {
  await apiClient.delete(`/admin/subjects/${id}`)
}

export async function listTopics(subjectId: number) {
  const { data } = await apiClient.get<{ data: Topic[] }>(`/admin/subjects/${subjectId}/topics`)
  return data.data
}

export async function createTopic(subjectId: number, payload: { name: string; orderIndex?: number }) {
  const { data } = await apiClient.post<{ data: Topic }>(`/admin/subjects/${subjectId}/topics`, payload)
  return data.data
}

// Tags
export async function listTags() {
  const { data } = await apiClient.get<{ data: Tag[] }>('/admin/tags')
  return data.data
}

export async function createTag(name: string) {
  const { data } = await apiClient.post<{ data: Tag }>('/admin/tags', { name })
  return data.data
}

export async function deleteTag(id: number) {
  await apiClient.delete(`/admin/tags/${id}`)
}
