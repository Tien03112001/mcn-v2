import { ExamAttemptSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ExamRoom from '#models/exam_room'
import ExamVariant from '#models/exam_variant'
import User from '#models/user'
import ExamAttemptAnswer from '#models/exam_attempt_answer'
import ViolationLog from '#models/violation_log'

export type ExamAttemptStatus = 'in_progress' | 'submitted' | 'auto_submitted' | 'expired'

export default class ExamAttempt extends ExamAttemptSchema {
  declare status: ExamAttemptStatus

  /**
   * Postgres numeric/decimal columns round-trip as strings — score is a
   * plain number|null everywhere else, read/write through this accessor.
   */
  get scoreNumber(): number | null {
    return this.score === null ? null : Number(this.score)
  }
  set scoreNumber(value: number | null) {
    this.score = value === null ? null : (String(value) as unknown as typeof this.score)
  }

  @belongsTo(() => ExamRoom)
  declare examRoom: BelongsTo<typeof ExamRoom>

  @belongsTo(() => ExamVariant)
  declare examVariant: BelongsTo<typeof ExamVariant>

  @belongsTo(() => User, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof User>

  @hasMany(() => ExamAttemptAnswer)
  declare answers: HasMany<typeof ExamAttemptAnswer>

  @hasMany(() => ViolationLog)
  declare violations: HasMany<typeof ViolationLog>
}
