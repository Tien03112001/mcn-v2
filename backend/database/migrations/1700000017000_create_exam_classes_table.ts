import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_classes'

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
      table
        .integer('class_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('classes')
        .onDelete('CASCADE')
      table.timestamp('opens_at').notNullable()
      table.timestamp('closes_at').notNullable()
      table
        .integer('assigned_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')

      table.timestamp('created_at').notNullable()

      table.unique(['exam_id', 'class_id'])
      table.index(['class_id', 'opens_at', 'closes_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
