import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('subject_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('subjects')
        .onDelete('RESTRICT')
      table
        .integer('topic_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('topics')
        .onDelete('SET NULL')
      table
        .integer('created_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table
        .enum('question_type', ['single_choice', 'multiple_choice', 'true_false_group', 'short_answer'])
        .notNullable()
      table.enum('difficulty', ['easy', 'medium', 'hard']).notNullable()
      table.text('content').notNullable()
      table.text('explanation').nullable()
      table.jsonb('answer_config').notNullable().defaultTo('{}')
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['subject_id', 'topic_id', 'difficulty', 'question_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
