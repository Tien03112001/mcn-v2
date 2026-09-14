import { ExamQuestionSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Exam from '#models/exam'
import Question from '#models/question'

export default class ExamQuestion extends ExamQuestionSchema {
  /**
   * Postgres numeric/decimal columns round-trip as strings — score is a
   * plain number everywhere else, read/write through this accessor.
   */
  get scoreNumber(): number {
    return Number(this.score)
  }
  set scoreNumber(value: number) {
    this.score = String(value) as unknown as typeof this.score
  }

  @belongsTo(() => Exam)
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>
}
