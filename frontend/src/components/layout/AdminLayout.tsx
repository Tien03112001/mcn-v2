import { LayoutDashboard, Users, School, BookOpen, Tag } from 'lucide-react'
import AppLayout, { type NavItem } from '@/components/layout/AppLayout'

const navItems: NavItem[] = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard },
  { label: 'Người dùng', to: '/admin/users', icon: Users },
  { label: 'Lớp học', to: '/admin/classes', icon: School },
  { label: 'Môn học', to: '/admin/subjects', icon: BookOpen },
  { label: 'Tag kỳ thi', to: '/admin/tags', icon: Tag },
]

export default function AdminLayout() {
  return <AppLayout navItems={navItems} title="Quản trị" />
}
