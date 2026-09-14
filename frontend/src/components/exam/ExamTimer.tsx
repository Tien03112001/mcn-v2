import { useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { useCountdown } from '@/hooks/use-countdown'
import { cn } from '@/lib/utils'

interface ExamTimerProps {
  deadlineAt: string
  onExpire: () => void
}

export default function ExamTimer({ deadlineAt, onExpire }: ExamTimerProps) {
  const { isExpired, label } = useCountdown(deadlineAt)
  const hasFired = useRef(false)

  useEffect(() => {
    if (isExpired && !hasFired.current) {
      hasFired.current = true
      onExpire()
    }
  }, [isExpired, onExpire])

  const remainingSeconds = Math.max(
    0,
    Math.floor((new Date(deadlineAt).getTime() - Date.now()) / 1000)
  )
  const isLow = remainingSeconds <= 60

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-1.5 font-mono text-sm font-medium',
        isLow ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'
      )}
    >
      <Clock className="size-4" />
      {label}
    </div>
  )
}
