import { LayoutDashboard, Users, BookOpen, Tag, FileQuestion, ClipboardList, FolderOpen } from 'lucide-react'
import AppLayout, { type NavItem } from '@/components/layout/AppLayout'
import { useAuthStore } from '@/stores/auth-store'

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard },
  { label: 'Người dùng', to: '/admin/users', icon: Users },
  { label: 'Môn học', to: '/admin/subjects', icon: BookOpen },
  { label: 'Tag kỳ thi', to: '/admin/tags', icon: Tag },
  { label: 'Câu hỏi', to: '/teacher/questions', icon: FileQuestion },
  { label: 'Đề thi', to: '/teacher/exams', icon: ClipboardList },
  { label: 'Tài liệu', to: '/documents', icon: FolderOpen },
]

const TEACHER_NAV_ITEMS: NavItem[] = [
  { label: 'Tổng quan', to: '/teacher', icon: LayoutDashboard },
  { label: 'Ngân hàng câu hỏi', to: '/teacher/questions', icon: FileQuestion },
  { label: 'Đề thi', to: '/teacher/exams', icon: ClipboardList },
  { label: 'Tài liệu', to: '/documents', icon: FolderOpen },
]

/**
 * Shared by both the admin-only and teacher-accessible route trees so the
 * sidebar always reflects the signed-in user's role, not which route tree
 * happened to match — an admin browsing under /teacher/* (via the
 * Câu hỏi/Đề thi bridge links) still sees the admin sidebar, not the
 * teacher one.
 */
export default function StaffLayout() {
  const role = useAuthStore((s) => s.user?.role)

  if (role === 'admin') {
    return <AppLayout navItems={ADMIN_NAV_ITEMS} title="Quản trị" />
  }
  return <AppLayout navItems={TEACHER_NAV_ITEMS} title="Giảng viên" />
}
