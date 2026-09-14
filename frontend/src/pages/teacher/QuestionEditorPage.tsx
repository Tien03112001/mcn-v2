import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { listSubjects } from '@/lib/api/admin'
import { createQuestion, getQuestion, updateQuestion } from '@/lib/api/questions'
import type {
  QuestionDifficulty,
  QuestionOption,
  QuestionPart,
  QuestionType,
  ShortAnswerConfigNumber,
  ShortAnswerConfigString,
} from '@/types/question'

const DEFAULT_OPTIONS: QuestionOption[] = ['A', 'B', 'C', 'D'].map((label, i) => ({
  id: -1 - i,
  label,
  content: '',
  isCorrect: false,
  orderIndex: i,
}))

const DEFAULT_PARTS: QuestionPart[] = ['a', 'b', 'c', 'd'].map((label, i) => ({
  id: -1 - i,
  label,
  content: '',
  isCorrect: false,
  orderIndex: i,
}))

export default function QuestionEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: subjects } = useQuery({ queryKey: ['admin', 'subjects'], queryFn: listSubjects })
  const { data: existing } = useQuery({
    queryKey: ['teacher', 'questions', id],
    queryFn: () => getQuestion(Number(id)),
    enabled: isEditing,
  })

  const [subjectId, setSubjectId] = useState<string>('')
  const [questionType, setQuestionType] = useState<QuestionType>('single_choice')
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium')
  const [content, setContent] = useState('')
  const [explanation, setExplanation] = useState('')
  const [options, setOptions] = useState<QuestionOption[]>(DEFAULT_OPTIONS)
  const [parts, setParts] = useState<QuestionPart[]>(DEFAULT_PARTS)
  const [shortAnswerType, setShortAnswerType] = useState<'number' | 'string'>('number')
  const [correctValue, setCorrectValue] = useState('')
  const [tolerance, setTolerance] = useState('0.01')

  useEffect(() => {
    if (!existing) return
    setSubjectId(String(existing.subjectId))
    setQuestionType(existing.questionType)
    setDifficulty(existing.difficulty)
    setContent(existing.content)
    setExplanation(existing.explanation ?? '')
    if (existing.options?.length) setOptions(existing.options)
    if (existing.parts?.length) setParts(existing.parts)
    if (existing.questionType === 'short_answer') {
      const config = existing.answerConfig as ShortAnswerConfigNumber | ShortAnswerConfigString
      setShortAnswerType(config.answerType)
      setCorrectValue(String(config.correctValue))
      if (config.answerType === 'number') setTolerance(String(config.tolerance))
    }
  }, [existing])

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        subjectId: Number(subjectId),
        questionType,
        difficulty,
        content,
        explanation: explanation || undefined,
        ...(questionType === 'single_choice' || questionType === 'multiple_choice'
          ? {
              options: options.map(({ label, content: c, isCorrect }) => ({ label, content: c, isCorrect: Boolean(isCorrect) })),
              answerConfig: questionType === 'multiple_choice' ? { scoringMode: 'all_or_nothing' as const } : {},
            }
          : {}),
        ...(questionType === 'true_false_group'
          ? {
              parts: parts.map(({ label, content: c, isCorrect }) => ({ label, content: c, isCorrect: Boolean(isCorrect) })),
              answerConfig: { partialScoring: [0, 0.1, 0.25, 0.5, 1] as [number, number, number, number, number] },
            }
          : {}),
        ...(questionType === 'short_answer'
          ? {
              answerConfig:
                shortAnswerType === 'number'
                  ? { answerType: 'number' as const, correctValue: Number(correctValue), tolerance: Number(tolerance) }
                  : { answerType: 'string' as const, correctValue },
            }
          : {}),
      }

      return isEditing ? updateQuestion(Number(id), payload) : createQuestion(payload)
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Cập nhật câu hỏi thành công' : 'Tạo câu hỏi thành công')
      queryClient.invalidateQueries({ queryKey: ['teacher', 'questions'] })
      navigate('/teacher/questions')
    },
    onError: () => toast.error('Không thể lưu câu hỏi'),
  })

  function updateOption(index: number, patch: Partial<QuestionOption>) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)))
  }

  function selectSingleCorrect(index: number) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index })))
  }

  function updatePart(index: number, patch: Partial<QuestionPart>) {
    setParts((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)))
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-2xl font-semibold">{isEditing ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}</h1>

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Môn học</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Độ khó</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as QuestionDifficulty)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Dạng câu hỏi</Label>
          <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)} disabled={isEditing}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_choice">Trắc nghiệm 1 đáp án</SelectItem>
              <SelectItem value="multiple_choice">Trắc nghiệm nhiều đáp án</SelectItem>
              <SelectItem value="true_false_group">Đúng/Sai nhiều ý</SelectItem>
              <SelectItem value="short_answer">Điền đáp số</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Nội dung câu hỏi</Label>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} required />
        </div>

        {(questionType === 'single_choice' || questionType === 'multiple_choice') && (
          <div className="flex flex-col gap-3">
            <Label>Các phương án (đánh dấu đáp án đúng)</Label>
            {options.map((option, index) => (
              <div key={option.label} className="flex items-center gap-3">
                {questionType === 'single_choice' ? (
                  <RadioGroup value={option.isCorrect ? option.label : ''} onValueChange={() => selectSingleCorrect(index)}>
                    <RadioGroupItem value={option.label} />
                  </RadioGroup>
                ) : (
                  <Checkbox
                    checked={Boolean(option.isCorrect)}
                    onCheckedChange={(checked) => updateOption(index, { isCorrect: Boolean(checked) })}
                  />
                )}
                <span className="w-6 font-medium">{option.label}</span>
                <Input
                  value={option.content}
                  onChange={(e) => updateOption(index, { content: e.target.value })}
                  placeholder={`Nội dung phương án ${option.label}`}
                  required
                />
              </div>
            ))}
          </div>
        )}

        {questionType === 'true_false_group' && (
          <div className="flex flex-col gap-3">
            <Label>Các ý (đánh dấu Đúng/Sai)</Label>
            {parts.map((part, index) => (
              <div key={part.label} className="flex items-center gap-3">
                <span className="w-6 font-medium">{part.label}</span>
                <Input
                  value={part.content}
                  onChange={(e) => updatePart(index, { content: e.target.value })}
                  placeholder={`Nội dung ý ${part.label}`}
                  required
                  className="flex-1"
                />
                <RadioGroup
                  className="flex flex-row gap-3"
                  value={part.isCorrect ? 'true' : 'false'}
                  onValueChange={(v) => updatePart(index, { isCorrect: v === 'true' })}
                >
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="true" id={`${part.label}-true`} />
                    <Label htmlFor={`${part.label}-true`} className="font-normal">
                      Đúng
                    </Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="false" id={`${part.label}-false`} />
                    <Label htmlFor={`${part.label}-false`} className="font-normal">
                      Sai
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        )}

        {questionType === 'short_answer' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Loại đáp án</Label>
              <Select value={shortAnswerType} onValueChange={(v) => setShortAnswerType(v as 'number' | 'string')}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Số</SelectItem>
                  <SelectItem value="string">Chuỗi văn bản</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Đáp án đúng</Label>
                <Input value={correctValue} onChange={(e) => setCorrectValue(e.target.value)} required />
              </div>
              {shortAnswerType === 'number' && (
                <div className="flex flex-col gap-2">
                  <Label>Dung sai</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label>Lời giải (hiển thị sau khi có kết quả)</Label>
          <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending || !subjectId}>
            {mutation.isPending ? 'Đang lưu...' : 'Lưu câu hỏi'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/questions')}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  )
}
