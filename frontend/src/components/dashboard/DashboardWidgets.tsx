import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const ATTEMPT_STATUS_LABEL: Record<string, string> = {
  in_progress: 'Đang làm bài',
  submitted: 'Đã nộp',
  auto_submitted: 'Tự động nộp',
  expired: 'Hết hạn',
}

export const ATTEMPT_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  in_progress: 'default',
  submitted: 'secondary',
  auto_submitted: 'outline',
  expired: 'destructive',
}

export function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  hint?: string
  to?: string
}

export function StatCard({ icon: Icon, label, value, hint, to }: StatCardProps) {
  const content = (
    <CardContent className="flex h-full items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{hint ?? ' '}</span>
      </div>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </div>
    </CardContent>
  )

  if (!to) {
    return <Card className="h-full">{content}</Card>
  }

  return (
    <Link
      to={to}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">{content}</Card>
    </Link>
  )
}

export function BreakdownRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value} <span className="text-xs text-muted-foreground">({pct}%)</span>
        </span>
      </div>
      <Progress value={pct} />
    </div>
  )
}
