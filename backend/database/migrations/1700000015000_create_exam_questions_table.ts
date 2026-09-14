import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_questions'

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
        .integer('question_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('questions')
        .onDelete('RESTRICT')
      table.integer('order_index').notNullable().defaultTo(0)
      table.decimal('score', 5, 2).notNullable()

      table.unique(['exam_id', 'question_id'])
      table.index(['question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
