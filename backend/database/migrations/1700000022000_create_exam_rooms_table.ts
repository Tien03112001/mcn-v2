import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('exam_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('exams')
        .onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.timestamp('opens_at').notNullable()
      table.timestamp('closes_at').notNullable()
      table
        .integer('created_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')

      table.timestamp('created_at').notNullable()

      table.index(['exam_id'])
      table.index(['exam_id', 'opens_at', 'closes_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
