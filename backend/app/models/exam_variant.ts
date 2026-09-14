import { ExamVariantSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Exam from '#models/exam'
import ExamAttempt from '#models/exam_attempt'

export interface OrderMap {
  [questionId: number]: number
}

export default class ExamVariant extends ExamVariantSchema {
  declare questionOrderMap: OrderMap | null
  declare optionOrderMap: OrderMap | null

  @belongsTo(() => Exam)
  declare exam: BelongsTo<typeof Exam>

  @hasMany(() => ExamAttempt)
  declare attempts: HasMany<typeof ExamAttempt>
}
