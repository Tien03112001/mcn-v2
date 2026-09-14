import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name', 255).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.enum('role', ['admin', 'teacher', 'student']).notNullable()
      table.string('student_code', 50).nullable().unique()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['role'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
