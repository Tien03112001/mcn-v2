import { LayoutDashboard, Users, BookOpen, Tag, FileQuestion, ClipboardList } from 'lucide-react'
import AppLayout, { type NavItem } from '@/components/layout/AppLayout'

const navItems: NavItem[] = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard },
  { label: 'Người dùng', to: '/admin/users', icon: Users },
  { label: 'Môn học', to: '/admin/subjects', icon: BookOpen },
  { label: 'Tag kỳ thi', to: '/admin/tags', icon: Tag },
  { label: 'Câu hỏi', to: '/teacher/questions', icon: FileQuestion },
  { label: 'Đề thi', to: '/teacher/exams', icon: ClipboardList },
]

export default function AdminLayout() {
  return <AppLayout navItems={navItems} title="Quản trị" />
}
