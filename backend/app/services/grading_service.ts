import Question, {
  type MultipleChoiceAnswerConfig,
  type ShortAnswerConfigNumber,
  type ShortAnswerConfigString,
  type TrueFalseGroupAnswerConfig,
} from '#models/question'

export interface GradingResult {
  isCorrect: boolean
  scoreAwarded: number
}

/**
 * Answer payload shapes submitted by students, one per question type.
 * Kept separate from AnswerConfig (which lives on the question and
 * defines what "correct" means) so the grading functions stay pure:
 * (question + config, student payload) -> score.
 */
export type AnswerPayload =
  | { selectedOptionId: number | null }
  | { selectedOptionIds: number[] }
  | { answers: Record<string, boolean> }
  | { rawValue: string | null }

const DEFAULT_PARTIAL_SCORING: TrueFalseGroupAnswerConfig['partialScoring'] = [0, 0.1, 0.25, 0.5, 1]

export default class GradingService {
  /**
   * Grades a single answer against its question's stored correct answer.
   * Must be called with the question's options/parts already preloaded
   * (`.preload('options')` / `.preload('parts')`) for choice-based types.
   */
  static async grade(question: Question, payload: AnswerPayload, maxScore: number): Promise<GradingResult> {
    switch (question.questionType) {
      case 'single_choice':
        return this.#gradeSingleChoice(question, payload, maxScore)
      case 'multiple_choice':
        return this.#gradeMultipleChoice(question, payload, maxScore)
      case 'true_false_group':
        return this.#gradeTrueFalseGroup(question, payload, maxScore)
      case 'short_answer':
        return this.#gradeShortAnswer(question, payload, maxScore)
    }
  }

  static #gradeSingleChoice(question: Question, payload: AnswerPayload, maxScore: number): GradingResult {
    const selectedOptionId = 'selectedOptionId' in payload ? payload.selectedOptionId : null
    if (selectedOptionId === null) {
      return { isCorrect: false, scoreAwarded: 0 }
    }

    const correctOption = question.options.find((option) => option.isCorrect)
    const isCorrect = correctOption?.id === selectedOptionId

    return { isCorrect, scoreAwarded: isCorrect ? maxScore : 0 }
  }

  static #gradeMultipleChoice(question: Question, payload: AnswerPayload, maxScore: number): GradingResult {
    const selectedOptionIds = 'selectedOptionIds' in payload ? payload.selectedOptionIds : []
    const config = question.answerConfig as MultipleChoiceAnswerConfig

    const correctIds = new Set(question.options.filter((o) => o.isCorrect).map((o) => o.id))
    const selectedIds = new Set(selectedOptionIds)

    const isExactMatch =
      correctIds.size === selectedIds.size && [...correctIds].every((id) => selectedIds.has(id))

    // Only "all_or_nothing" is implemented; the config field is kept so a
    // future "partial" scoring mode can be added without a schema change.
    void config

    return { isCorrect: isExactMatch, scoreAwarded: isExactMatch ? maxScore : 0 }
  }

  static #gradeTrueFalseGroup(question: Question, payload: AnswerPayload, maxScore: number): GradingResult {
    const answers = 'answers' in payload ? payload.answers : {}
    const config = question.answerConfig as TrueFalseGroupAnswerConfig
    const partialScoring = config.partialScoring ?? DEFAULT_PARTIAL_SCORING

    let correctCount = 0
    for (const part of question.parts) {
      if (answers[part.label] === part.isCorrect) {
        correctCount++
      }
    }

    const ratio = partialScoring[correctCount] ?? 0
    const scoreAwarded = Math.round(maxScore * ratio * 100) / 100

    return { isCorrect: correctCount === question.parts.length, scoreAwarded }
  }

  static #gradeShortAnswer(question: Question, payload: AnswerPayload, maxScore: number): GradingResult {
    const rawValue = 'rawValue' in payload ? payload.rawValue : null
    if (rawValue === null || rawValue.trim() === '') {
      return { isCorrect: false, scoreAwarded: 0 }
    }

    const config = question.answerConfig as ShortAnswerConfigNumber | ShortAnswerConfigString

    let isCorrect = false
    if (config.answerType === 'number') {
      const numericValue = Number(rawValue)
      if (!Number.isNaN(numericValue)) {
        isCorrect = Math.abs(numericValue - config.correctValue) <= config.tolerance
      }
      if (!isCorrect && config.acceptedAlternatives) {
        isCorrect = config.acceptedAlternatives.includes(rawValue.trim())
      }
    } else {
      const normalize = (value: string) => {
        let v = config.trim !== false ? value.trim() : value
        v = config.caseSensitive ? v : v.toLowerCase()
        return v
      }
      const normalizedInput = normalize(rawValue)
      const candidates = [config.correctValue, ...(config.acceptedAlternatives ?? [])]
      isCorrect = candidates.some((candidate) => normalize(candidate) === normalizedInput)
    }

    return { isCorrect, scoreAwarded: isCorrect ? maxScore : 0 }
  }
}
