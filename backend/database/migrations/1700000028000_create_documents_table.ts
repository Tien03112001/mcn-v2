import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.string('category', 100).nullable()
      table.string('file_name', 255).notNullable()
      table.string('stored_path', 500).notNullable()
      table.string('mime_type', 100).nullable()
      table.bigInteger('size_bytes').nullable()
      table
        .integer('uploaded_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')

      table.timestamp('created_at').notNullable()

      table.index(['category'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
