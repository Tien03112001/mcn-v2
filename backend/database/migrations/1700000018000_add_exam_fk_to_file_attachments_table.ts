import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'file_attachments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('exam_id').references('id').inTable('exams').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('exam_id')
    })
  }
}
