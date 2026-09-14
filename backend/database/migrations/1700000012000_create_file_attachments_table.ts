import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'file_attachments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('question_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('questions')
        .onDelete('CASCADE')
      table.integer('exam_id').unsigned().nullable()
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

      table.index(['question_id'])
      table.index(['exam_id'])
      table.check('(question_id is not null) <> (exam_id is not null)', {}, 'file_attachments_owner_check')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
