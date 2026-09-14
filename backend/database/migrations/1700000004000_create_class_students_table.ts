import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'class_students'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('class_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('classes')
        .onDelete('CASCADE')
      table
        .integer('student_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('enrolled_at').notNullable()

      table.unique(['class_id', 'student_id'])
      table.index(['student_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
