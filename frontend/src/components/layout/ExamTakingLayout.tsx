import type { ReactNode } from 'react'

interface ExamTakingLayoutProps {
  headerRight: ReactNode
  children: ReactNode
}

/**
 * Minimal layout for the exam-taking screen — no sidebar/nav so a
 * student can't easily wander off, just a fixed header with the timer
 * and submit action.
 */
export default function ExamTakingLayout({ headerRight, children }: ExamTakingLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
        <span className="font-semibold">Đang làm bài thi</span>
        {headerRight}
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-6">{children}</main>
    </div>
  )
}
