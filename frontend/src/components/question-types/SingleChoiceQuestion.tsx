import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { AttemptQuestion } from '@/types/attempt'

interface SingleChoiceQuestionProps {
  question: AttemptQuestion
  value: number | null
  onChange: (selectedOptionId: number) => void
}

export default function SingleChoiceQuestion({ question, value, onChange }: SingleChoiceQuestionProps) {
  return (
    <RadioGroup value={value ? String(value) : ''} onValueChange={(v) => onChange(Number(v))} className="gap-3">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center gap-3">
          <RadioGroupItem value={String(option.id)} id={`opt-${option.id}`} />
          <Label htmlFor={`opt-${option.id}`} className="font-normal">
            <span className="mr-2 font-medium">{option.label}.</span>
            {option.content}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
