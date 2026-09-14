import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_attempt_answers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('exam_attempt_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('exam_attempts')
        .onDelete('CASCADE')
      table
        .integer('question_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('questions')
        .onDelete('RESTRICT')
      table.jsonb('answer_payload').notNullable()
      table.boolean('is_correct').nullable()
      table.decimal('score_awarded', 5, 2).nullable()
      table.timestamp('answered_at').notNullable()

      table.unique(['exam_attempt_id', 'question_id'])
      table.index(['exam_attempt_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
