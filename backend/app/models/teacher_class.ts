import { TeacherClassSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Class from '#models/class'
import User from '#models/user'

export default class TeacherClass extends TeacherClassSchema {
  @belongsTo(() => Class)
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => User, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof User>
}
