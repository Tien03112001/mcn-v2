import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'violation_logs'

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
        .enum('violation_type', ['tab_hidden', 'window_blur', 'fullscreen_exit'])
        .notNullable()
        .defaultTo('tab_hidden')
      table.timestamp('occurred_at').notNullable()
      table.timestamp('client_reported_at').nullable()
      table.jsonb('metadata').nullable()

      table.index(['exam_attempt_id', 'occurred_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
