import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'documents'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['category'])
      table.dropColumn('category')
      table
        .integer('subject_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('subjects')
        .onDelete('SET NULL')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.index(['subject_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['subject_id'])
      table.dropIndex(['subject_id'])
      table.dropColumn('subject_id')
      table.string('category', 100).nullable()
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.index(['category'])
    })
  }
}
