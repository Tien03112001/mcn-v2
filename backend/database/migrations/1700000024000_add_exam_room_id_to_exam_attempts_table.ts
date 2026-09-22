import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_attempts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('exam_room_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('exam_rooms')
        .onDelete('RESTRICT')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('exam_room_id')
    })
  }
}
