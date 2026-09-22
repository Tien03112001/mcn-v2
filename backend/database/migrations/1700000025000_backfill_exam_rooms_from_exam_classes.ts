import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * One-time data migration: turns each existing "exam assigned to a class"
 * row into its own exam room (with a copy of that class's roster at the
 * time), and repoints existing exam_attempts at the new room. Forward-only
 * — down() is a no-op since there is nothing meaningful to reverse.
 */
export default class extends BaseSchema {
  async up() {
    const examClasses = await this.db
      .from('exam_classes')
      .select('id', 'exam_id', 'class_id', 'opens_at', 'closes_at', 'assigned_by', 'created_at')

    for (const ec of examClasses) {
      const klass = await this.db.from('classes').where('id', ec.class_id).first()

      const inserted = await this.db
        .table('exam_rooms')
        .insert({
          exam_id: ec.exam_id,
          name: klass?.name ?? `Phòng thi ${ec.id}`,
          opens_at: ec.opens_at,
          closes_at: ec.closes_at,
          created_by: ec.assigned_by,
          created_at: ec.created_at,
        })
        .returning('id')
      const roomId = typeof inserted[0] === 'object' ? inserted[0].id : inserted[0]

      const classStudents = await this.db
        .from('class_students')
        .where('class_id', ec.class_id)
        .select('student_id', 'enrolled_at')

      for (const cs of classStudents) {
        await this.db.table('exam_room_students').insert({
          exam_room_id: roomId,
          student_id: cs.student_id,
          added_at: cs.enrolled_at,
        })
      }

      await this.db
        .from('exam_attempts')
        .where('exam_class_id', ec.id)
        .update({ exam_room_id: roomId })
    }
  }

  async down() {
    // Forward-only: no reverse mapping back to classes/exam_classes.
  }
}
