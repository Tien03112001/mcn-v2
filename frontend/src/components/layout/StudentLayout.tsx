import { ClipboardList, History } from 'lucide-react'
import AppLayout, { type NavItem } from '@/components/layout/AppLayout'

const navItems: NavItem[] = [
  { label: 'Đề thi của tôi', to: '/student', icon: ClipboardList },
  { label: 'Lịch sử làm bài', to: '/student/history', icon: History },
]

export default function StudentLayout() {
  return <AppLayout navItems={navItems} title="Sinh viên" />
}
