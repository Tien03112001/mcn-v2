import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { AttemptQuestion } from '@/types/attempt'

interface TrueFalseGroupQuestionProps {
  question: AttemptQuestion
  value: Record<string, boolean>
  onChange: (answers: Record<string, boolean>) => void
}

export default function TrueFalseGroupQuestion({ question, value, onChange }: TrueFalseGroupQuestionProps) {
  function setPart(label: string, isTrue: boolean) {
    onChange({ ...value, [label]: isTrue })
  }

  return (
    <div className="flex flex-col gap-3">
      {question.parts.map((part) => (
        <div key={part.label} className="flex items-center justify-between gap-4 rounded-md border p-3">
          <span>
            <span className="mr-2 font-medium">{part.label})</span>
            {part.content}
          </span>
          <ToggleGroup
            type="single"
            value={value[part.label] === undefined ? undefined : value[part.label] ? 'true' : 'false'}
            onValueChange={(v) => {
              if (v) setPart(part.label, v === 'true')
            }}
          >
            <ToggleGroupItem value="true">Đúng</ToggleGroupItem>
            <ToggleGroupItem value="false">Sai</ToggleGroupItem>
          </ToggleGroup>
        </div>
      ))}
    </div>
  )
}
