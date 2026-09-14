import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'topics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('subject_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('subjects')
        .onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.integer('order_index').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['subject_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
