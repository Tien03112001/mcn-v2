import { useEffect, useState } from 'react'

/**
 * Counts down to an absolute deadline (server-issued ISO timestamp),
 * recomputing from wall-clock time each tick rather than decrementing
 * a local counter — so the displayed time stays correct even if the
 * tab was backgrounded and timers got throttled.
 */
export function useCountdown(deadlineIso: string) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(deadlineIso).getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(new Date(deadlineIso).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [deadlineIso])

  const isExpired = remainingMs <= 0
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return {
    isExpired,
    label: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  }
}
