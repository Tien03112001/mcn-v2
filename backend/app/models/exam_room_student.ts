import { ExamRoomStudentSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ExamRoom from '#models/exam_room'
import User from '#models/user'

export default class ExamRoomStudent extends ExamRoomStudentSchema {
  @belongsTo(() => ExamRoom)
  declare examRoom: BelongsTo<typeof ExamRoom>

  @belongsTo(() => User, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof User>
}
