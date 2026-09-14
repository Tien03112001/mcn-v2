import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_classes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('teacher_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('class_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('classes')
        .onDelete('CASCADE')
      table.timestamp('assigned_at').notNullable()

      table.unique(['teacher_id', 'class_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
