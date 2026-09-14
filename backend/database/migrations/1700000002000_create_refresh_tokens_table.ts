import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refresh_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('token_hash', 255).notNullable().unique()
      table.uuid('family_id').notNullable()
      table.boolean('is_revoked').notNullable().defaultTo(false)
      table.timestamp('expires_at').notNullable()

      table.timestamp('created_at').notNullable()

      table.index(['user_id'])
      table.index(['family_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
