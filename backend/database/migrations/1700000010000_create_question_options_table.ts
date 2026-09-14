import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'question_options'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('question_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.string('label', 10).notNullable()
      table.text('content').notNullable()
      table.boolean('is_correct').notNullable().defaultTo(false)
      table.integer('order_index').notNullable().defaultTo(0)

      table.index(['question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
