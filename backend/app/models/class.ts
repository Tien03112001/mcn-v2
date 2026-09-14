import { ClassSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import ClassStudent from '#models/class_student'
import TeacherClass from '#models/teacher_class'

export default class Class extends ClassSchema {
  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => ClassStudent)
  declare classStudents: HasMany<typeof ClassStudent>

  @manyToMany(() => User, {
    pivotTable: 'class_students',
    localKey: 'id',
    pivotForeignKey: 'class_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'student_id',
    pivotTimestamps: { createdAt: 'enrolled_at', updatedAt: false },
  })
  declare students: ManyToMany<typeof User>

  @hasMany(() => TeacherClass)
  declare teacherClasses: HasMany<typeof TeacherClass>

  @manyToMany(() => User, {
    pivotTable: 'teacher_classes',
    localKey: 'id',
    pivotForeignKey: 'class_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'teacher_id',
    pivotTimestamps: { createdAt: 'assigned_at', updatedAt: false },
  })
  declare teachers: ManyToMany<typeof User>
}
