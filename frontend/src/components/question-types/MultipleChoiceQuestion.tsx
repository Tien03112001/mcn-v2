import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { AttemptQuestion } from '@/types/attempt'

interface MultipleChoiceQuestionProps {
  question: AttemptQuestion
  value: number[]
  onChange: (selectedOptionIds: number[]) => void
}

export default function MultipleChoiceQuestion({ question, value, onChange }: MultipleChoiceQuestionProps) {
  function toggle(optionId: number, checked: boolean) {
    onChange(checked ? [...value, optionId] : value.filter((id) => id !== optionId))
  }

  return (
    <div className="flex flex-col gap-3">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center gap-3">
          <Checkbox
            id={`opt-${option.id}`}
            checked={value.includes(option.id)}
            onCheckedChange={(checked) => toggle(option.id, Boolean(checked))}
          />
          <Label htmlFor={`opt-${option.id}`} className="font-normal">
            <span className="mr-2 font-medium">{option.label}.</span>
            {option.content}
          </Label>
        </div>
      ))}
    </div>
  )
}
