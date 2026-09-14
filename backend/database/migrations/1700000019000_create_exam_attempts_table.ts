import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_attempts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('exam_class_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('exam_classes')
        .onDelete('RESTRICT')
      table
        .integer('exam_variant_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('exam_variants')
        .onDelete('RESTRICT')
      table
        .integer('student_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('started_at').notNullable()
      table.timestamp('deadline_at').notNullable()
      table.timestamp('submitted_at').nullable()
      table
        .enum('status', ['in_progress', 'submitted', 'auto_submitted', 'expired'])
        .notNullable()
        .defaultTo('in_progress')
      table.decimal('score', 6, 2).nullable()
      table.integer('violation_count').notNullable().defaultTo(0)
      table.boolean('is_flagged').notNullable().defaultTo(false)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['exam_class_id', 'student_id'])
      table.index(['student_id', 'status'])
      table.index(['exam_class_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
