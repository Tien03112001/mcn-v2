export type ExamStatus = 'draft' | 'published' | 'archived'

export interface ExamTag {
  id: number
  name: string
  slug?: string
}

export interface Exam {
  id: number
  subjectId: number
  createdBy: number
  title: string
  description: string | null
  durationMinutes: number
  totalScore: number
  maxViolationCount: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  generationMode: 'manual' | 'matrix_random'
  status: ExamStatus
  createdAt: string
  updatedAt: string
  tags?: ExamTag[]
  questions?: ExamQuestionSummary[]
}

export interface ExamQuestionSummary {
  examQuestionId: number
  questionId: number
  orderIndex: number
  score: number
  question?: {
    id: number
    questionType: string
    difficulty: string
    content: string
  }
}

export interface ExamClassAssignment {
  id: number
  classId: number
  className?: string
  opensAt: string
  closesAt: string
}

export interface StudentExamListItem {
  examClassId: number
  examId: number
  title: string
  subjectId: number
  durationMinutes: number
  totalScore: number
  tags: { id: number; name: string }[]
  opensAt: string
  closesAt: string
  attemptStatus: string | null
}
