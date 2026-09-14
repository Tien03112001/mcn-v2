import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exams'

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
        .integer('created_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.integer('duration_minutes').notNullable()
      table.decimal('total_score', 6, 2).notNullable().defaultTo(100)
      table.integer('max_violation_count').notNullable().defaultTo(3)
      table.boolean('shuffle_questions').notNullable().defaultTo(false)
      table.boolean('shuffle_options').notNullable().defaultTo(false)
      table.enum('generation_mode', ['manual', 'matrix_random']).notNullable().defaultTo('manual')
      table.enum('status', ['draft', 'published', 'archived']).notNullable().defaultTo('draft')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['subject_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
