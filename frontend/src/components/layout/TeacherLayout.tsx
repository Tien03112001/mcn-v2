import { LayoutDashboard, FileQuestion, ClipboardList } from 'lucide-react'
import AppLayout, { type NavItem } from '@/components/layout/AppLayout'

const navItems: NavItem[] = [
  { label: 'Tổng quan', to: '/teacher', icon: LayoutDashboard },
  { label: 'Ngân hàng câu hỏi', to: '/teacher/questions', icon: FileQuestion },
  { label: 'Đề thi', to: '/teacher/exams', icon: ClipboardList },
]

export default function TeacherLayout() {
  return <AppLayout navItems={navItems} title="Giảng viên" />
}
