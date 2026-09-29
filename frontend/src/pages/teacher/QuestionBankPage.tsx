import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'
import { PaginationControls } from '@/components/common/PaginationControls'
import { listSubjects } from '@/lib/api/admin'
import { deleteQuestion, listQuestions } from '@/lib/api/questions'
import { getErrorMessage } from '@/lib/api-error'
import type { QuestionDifficulty, QuestionType } from '@/types/question'

const DELETE_QUESTION_ERROR: Record<string, string> = {
  QUESTION_IN_USE: 'Không thể xóa: câu hỏi này đang được dùng trong một đề thi.',
}

const TYPE_LABEL: Record<QuestionType, string> = {
  single_choice: 'Trắc nghiệm 1 đáp án',
  multiple_choice: 'Trắc nghiệm nhiều đáp án',
  true_false_group: 'Đúng/Sai nhiều ý',
  short_answer: 'Điền đáp số',
}

const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
}

const DIFFICULTY_VARIANT: Record<QuestionDifficulty, 'secondary' | 'default' | 'destructive'> = {
  easy: 'secondary',
  medium: 'default',
  hard: 'destructive',
}

export default function QuestionBankPage() {
  const [subjectId, setSubjectId] = useState<string>('all')
  const [difficulty, setDifficulty] = useState<string>('all')
  const [type, setType] = useState<string>('all')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const { data: subjects } = useQuery({ queryKey: ['admin', 'subjects'], queryFn: listSubjects })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['teacher', 'questions', { subjectId, difficulty, type, keyword, page }],
    queryFn: () =>
      listQuestions({
        subjectId: subjectId === 'all' ? undefined : Number(subjectId),
        difficulty: difficulty === 'all' ? undefined : (difficulty as QuestionDifficulty),
        type: type === 'all' ? undefined : (type as QuestionType),
        keyword: keyword || undefined,
        page,
      }),
  })

  function resetToFirstPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setPage(1)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: () => {
      toast.success('Đã xóa câu hỏi')
      queryClient.invalidateQueries({ queryKey: ['teacher', 'questions'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, DELETE_QUESTION_ERROR, 'Không thể xóa câu hỏi')),
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ngân hàng câu hỏi</h1>
        <Button asChild>
          <Link to="/teacher/questions/new">Tạo câu hỏi</Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Tìm theo nội dung..."
          value={keyword}
          onChange={(e) => resetToFirstPage(setKeyword)(e.target.value)}
          className="max-w-xs"
        />
        <Select value={subjectId} onValueChange={resetToFirstPage(setSubjectId)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Môn học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả môn</SelectItem>
            {subjects?.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={resetToFirstPage(setDifficulty)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả độ khó</SelectItem>
            <SelectItem value="easy">Dễ</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="hard">Khó</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={resetToFirstPage(setType)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Dạng câu hỏi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả dạng</SelectItem>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nội dung</TableHead>
            <TableHead>Dạng</TableHead>
            <TableHead>Độ khó</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Đang tải...
              </TableCell>
            </TableRow>
          )}
          {data?.data.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="max-w-md">
                <Link to={`/teacher/questions/${q.id}`} className="hover:underline">
                  {q.content}
                </Link>
              </TableCell>
              <TableCell>{TYPE_LABEL[q.questionType]}</TableCell>
              <TableCell>
                <Badge variant={DIFFICULTY_VARIANT[q.difficulty]}>{DIFFICULTY_LABEL[q.difficulty]}</Badge>
              </TableCell>
              <TableCell>
                <ConfirmDeleteButton
                  title="Xóa câu hỏi này?"
                  description="Hành động này không thể hoàn tác."
                  pending={deleteMutation.isPending}
                  onConfirm={() => deleteMutation.mutate(q.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data && (
        <PaginationControls
          currentPage={data.metadata.currentPage}
          lastPage={data.metadata.lastPage}
          total={data.metadata.total}
          perPage={data.metadata.perPage}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
