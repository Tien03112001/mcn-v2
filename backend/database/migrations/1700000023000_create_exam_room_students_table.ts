import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_room_students'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('exam_room_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('exam_rooms')
        .onDelete('CASCADE')
      table
        .integer('student_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('added_at').notNullable()

      table.unique(['exam_room_id', 'student_id'])
      table.index(['student_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
