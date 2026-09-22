import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.dropTable('exam_classes')
    this.schema.dropTable('class_students')
    this.schema.dropTable('teacher_classes')
    this.schema.dropTable('classes')
  }

  async down() {
    this.schema.createTable('classes', (table) => {
      table.increments('id').notNullable()
      table.string('code', 50).notNullable().unique()
      table.string('name', 255).notNullable()
      table.string('academic_year', 20).nullable()
      table
        .integer('created_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('teacher_classes', (table) => {
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

    this.schema.createTable('class_students', (table) => {
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

    this.schema.createTable('exam_classes', (table) => {
      table.increments('id').notNullable()
      table
        .integer('exam_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('exams')
        .onDelete('CASCADE')
      table
        .integer('class_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('classes')
        .onDelete('CASCADE')
      table.timestamp('opens_at').notNullable()
      table.timestamp('closes_at').notNullable()
      table
        .integer('assigned_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.timestamp('created_at').notNullable()
      table.unique(['exam_id', 'class_id'])
      table.index(['class_id', 'opens_at', 'closes_at'])
    })
  }
}
