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

export interface ClassItem {
  id: number
  code: string
  name: string
  academicYear: string | null
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: number
  code: string
  name: string
  description: string | null
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

// Users
export async function listUsers(params?: { role?: UserRole; page?: number }) {
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

export async function updateUser(id: number, payload: Partial<{ fullName: string; email: string; isActive: boolean }>) {
  const { data } = await apiClient.patch<{ data: User }>(`/admin/users/${id}`, payload)
  return data.data
}

export async function deactivateUser(id: number) {
  await apiClient.delete(`/admin/users/${id}`)
}

export async function resetUserPassword(id: number, password: string) {
  await apiClient.post(`/admin/users/${id}/reset-password`, { password })
}

// Classes
export async function listClasses(params?: { page?: number }) {
  const { data } = await apiClient.get<PaginatedResponse<ClassItem>>('/admin/classes', { params })
  return data
}

export async function createClass(payload: { code: string; name: string; academicYear?: string }) {
  const { data } = await apiClient.post<{ data: ClassItem }>('/admin/classes', payload)
  return data.data
}

export async function listClassStudents(classId: number) {
  const { data } = await apiClient.get<{ data: User[] }>(`/admin/classes/${classId}/students`)
  return data.data
}

export async function addClassStudent(classId: number, studentId: number) {
  const { data } = await apiClient.post<{ data: User }>(`/admin/classes/${classId}/students`, { studentId })
  return data.data
}

export async function removeClassStudent(classId: number, studentId: number) {
  await apiClient.delete(`/admin/classes/${classId}/students/${studentId}`)
}

export async function importClassStudents(classId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<{ data: { enrolled: number; created: number; skipped: string[] } }>(
    `/admin/classes/${classId}/students/import`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data.data
}

export async function assignClassTeacher(classId: number, teacherId: number) {
  const { data } = await apiClient.post<{ data: User }>(`/admin/classes/${classId}/teachers`, { teacherId })
  return data.data
}

export async function removeClassTeacher(classId: number, teacherId: number) {
  await apiClient.delete(`/admin/classes/${classId}/teachers/${teacherId}`)
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
