import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_variants'

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
      table.string('variant_code', 20).notNullable()
      table.jsonb('question_order_map').nullable()
      table.jsonb('option_order_map').nullable()

      table.timestamp('created_at').notNullable()

      table.unique(['exam_id', 'variant_code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
