import { ExamRoomSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Exam from '#models/exam'
import User from '#models/user'
import ExamRoomStudent from '#models/exam_room_student'
import ExamAttempt from '#models/exam_attempt'

export default class ExamRoom extends ExamRoomSchema {
  @belongsTo(() => Exam)
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => ExamRoomStudent)
  declare roomStudents: HasMany<typeof ExamRoomStudent>

  @manyToMany(() => User, {
    pivotTable: 'exam_room_students',
    localKey: 'id',
    pivotForeignKey: 'exam_room_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'student_id',
    pivotTimestamps: { createdAt: 'added_at', updatedAt: false },
  })
  declare students: ManyToMany<typeof User>

  @hasMany(() => ExamAttempt)
  declare attempts: HasMany<typeof ExamAttempt>
}
