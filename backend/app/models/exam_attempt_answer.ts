import { ExamAttemptAnswerSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ExamAttempt from '#models/exam_attempt'
import Question from '#models/question'
import type { AnswerPayload } from '#services/grading_service'

export default class ExamAttemptAnswer extends ExamAttemptAnswerSchema {
  declare answerPayload: AnswerPayload

  get scoreAwardedNumber(): number | null {
    return this.scoreAwarded === null ? null : Number(this.scoreAwarded)
  }
  set scoreAwardedNumber(value: number | null) {
    this.scoreAwarded = value === null ? null : (String(value) as unknown as typeof this.scoreAwarded)
  }

  @belongsTo(() => ExamAttempt)
  declare examAttempt: BelongsTo<typeof ExamAttempt>

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>
}
