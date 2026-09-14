import { ExamClassSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Exam from '#models/exam'
import Class from '#models/class'
import User from '#models/user'
import ExamAttempt from '#models/exam_attempt'

export default class ExamClass extends ExamClassSchema {
  @belongsTo(() => Exam)
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => Class)
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => User, { foreignKey: 'assignedBy' })
  declare assignedByUser: BelongsTo<typeof User>

  @hasMany(() => ExamAttempt)
  declare attempts: HasMany<typeof ExamAttempt>
}
