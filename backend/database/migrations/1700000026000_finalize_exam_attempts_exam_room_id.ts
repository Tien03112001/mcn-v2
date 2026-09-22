import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_attempts'

  async up() {
    this.schema.raw(`ALTER TABLE ${this.tableName} ALTER COLUMN exam_room_id SET NOT NULL`)

    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['exam_room_id', 'student_id'])
      table.index(['exam_room_id'])
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['exam_class_id'])
      table.dropUnique(['exam_class_id', 'student_id'])
      table.dropIndex(['exam_class_id'])
      table.dropColumn('exam_class_id')
    })
  }

  async down() {
    // Schema-level reversal only — the exam_class_id data itself is not
    // recoverable once dropped (see the backfill migration's down()).
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('exam_class_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('exam_classes')
        .onDelete('RESTRICT')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['exam_room_id', 'student_id'])
      table.dropIndex(['exam_room_id'])
    })

    this.schema.raw(`ALTER TABLE ${this.tableName} ALTER COLUMN exam_room_id DROP NOT NULL`)
  }
}
