import { Input } from '@/components/ui/input'

interface ShortAnswerQuestionProps {
  value: string
  onChange: (rawValue: string) => void
}

export default function ShortAnswerQuestion({ value, onChange }: ShortAnswerQuestionProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Nhập đáp án của bạn"
      className="max-w-xs"
    />
  )
}
