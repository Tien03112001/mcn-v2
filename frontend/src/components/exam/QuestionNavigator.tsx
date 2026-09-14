import { cn } from '@/lib/utils'

interface QuestionNavigatorProps {
  totalQuestions: number
  answeredIndexes: Set<number>
  currentIndex: number
  onSelect: (index: number) => void
}

export default function QuestionNavigator({
  totalQuestions,
  answeredIndexes,
  currentIndex,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: totalQuestions }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            'flex size-9 items-center justify-center rounded-md border text-sm font-medium',
            currentIndex === i && 'border-primary ring-2 ring-primary/30',
            answeredIndexes.has(i) ? 'bg-primary/10 text-primary' : 'bg-background text-muted-foreground'
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}
