import SingleChoiceQuestion from '@/components/question-types/SingleChoiceQuestion'
import MultipleChoiceQuestion from '@/components/question-types/MultipleChoiceQuestion'
import TrueFalseGroupQuestion from '@/components/question-types/TrueFalseGroupQuestion'
import ShortAnswerQuestion from '@/components/question-types/ShortAnswerQuestion'
import type { AnswerPayload, AttemptQuestion } from '@/types/attempt'

interface QuestionRendererProps {
  question: AttemptQuestion
  value: AnswerPayload | null | undefined
  onChange: (payload: AnswerPayload) => void
}

/**
 * Dispatches to one of the 4 question-type components based on
 * question.questionType — mirrors the 4-branch switch in the backend's
 * grading_service.ts one-to-one.
 */
export default function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.questionType) {
    case 'single_choice': {
      const selectedOptionId = value && 'selectedOptionId' in value ? value.selectedOptionId : null
      return (
        <SingleChoiceQuestion
          question={question}
          value={selectedOptionId}
          onChange={(id) => onChange({ selectedOptionId: id })}
        />
      )
    }
    case 'multiple_choice': {
      const selectedOptionIds = value && 'selectedOptionIds' in value ? value.selectedOptionIds : []
      return (
        <MultipleChoiceQuestion
          question={question}
          value={selectedOptionIds}
          onChange={(ids) => onChange({ selectedOptionIds: ids })}
        />
      )
    }
    case 'true_false_group': {
      const answers = value && 'answers' in value ? value.answers : {}
      return (
        <TrueFalseGroupQuestion
          question={question}
          value={answers}
          onChange={(a) => onChange({ answers: a })}
        />
      )
    }
    case 'short_answer': {
      const rawValue = value && 'rawValue' in value ? (value.rawValue ?? '') : ''
      return <ShortAnswerQuestion value={rawValue} onChange={(v) => onChange({ rawValue: v })} />
    }
  }
}
