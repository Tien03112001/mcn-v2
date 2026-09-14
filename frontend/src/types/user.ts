export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id: number
  fullName: string
  email: string
  role: UserRole
  studentCode: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  initials: string
}
