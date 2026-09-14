import { useEffect, useRef, useState } from 'react'
import { reportViolation } from '@/lib/api/attempts'

interface UseExamProctoringOptions {
  attemptId: number
  enabled: boolean
  onAutoSubmit: () => void
}

/**
 * Watches for the student leaving the exam tab/window (Page Visibility
 * API + window blur) and reports each occurrence to the server. The
 * server is the sole source of truth for the violation count and the
 * auto-submit decision — this hook only forwards events and reflects
 * back whatever the server decided, so a tampered client can't hide
 * violations or fake a lower count.
 */
export function useExamProctoring({ attemptId, enabled, onAutoSubmit }: UseExamProctoringOptions) {
  const [violationCount, setViolationCount] = useState(0)
  const [maxViolationCount, setMaxViolationCount] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const isReporting = useRef(false)

  useEffect(() => {
    if (!enabled) return

    async function report(type: 'tab_hidden' | 'window_blur') {
      if (isReporting.current) return
      isReporting.current = true
      try {
        const result = await reportViolation(attemptId, type)
        setViolationCount(result.violationCount)
        setMaxViolationCount(result.maxViolationCount)
        if (result.autoSubmitted) {
          onAutoSubmit()
        } else {
          setShowWarning(true)
        }
      } catch {
        // Network hiccup reporting the violation — nothing actionable
        // client-side; the next visibility change will retry.
      } finally {
        isReporting.current = false
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        report('tab_hidden')
      }
    }

    function handleBlur() {
      report('window_blur')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [attemptId, enabled, onAutoSubmit])

  return {
    violationCount,
    maxViolationCount,
    showWarning,
    dismissWarning: () => setShowWarning(false),
  }
}
