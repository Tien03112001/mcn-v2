import { ClassStudentSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Class from '#models/class'
import User from '#models/user'

export default class ClassStudent extends ClassStudentSchema {
  @belongsTo(() => Class)
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => User, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof User>
}
