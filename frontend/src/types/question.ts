export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false_group' | 'short_answer'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export interface QuestionOption {
  id: number
  label: string
  content: string
  isCorrect?: boolean
  orderIndex: number
}

export interface QuestionPart {
  id: number
  label: string
  content: string
  isCorrect?: boolean
  orderIndex: number
}

export interface MultipleChoiceAnswerConfig {
  scoringMode: 'all_or_nothing'
}

export interface TrueFalseGroupAnswerConfig {
  partialScoring: [number, number, number, number, number]
}

export interface ShortAnswerConfigNumber {
  answerType: 'number'
  correctValue: number
  tolerance: number
  acceptedAlternatives?: string[]
}

export interface ShortAnswerConfigString {
  answerType: 'string'
  correctValue: string
  caseSensitive?: boolean
  trim?: boolean
  acceptedAlternatives?: string[]
}

export type AnswerConfig =
  | Record<string, unknown>
  | MultipleChoiceAnswerConfig
  | TrueFalseGroupAnswerConfig
  | ShortAnswerConfigNumber
  | ShortAnswerConfigString

export interface Question {
  id: number
  subjectId: number
  topicId: number | null
  createdBy: number
  questionType: QuestionType
  difficulty: QuestionDifficulty
  content: string
  explanation: string | null
  answerConfig: AnswerConfig
  isActive: boolean
  createdAt: string
  updatedAt: string
  options?: QuestionOption[]
  parts?: QuestionPart[]
}
