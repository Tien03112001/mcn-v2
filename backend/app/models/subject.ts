import { SubjectSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Topic from '#models/topic'

export default class Subject extends SubjectSchema {
  @hasMany(() => Topic)
  declare topics: HasMany<typeof Topic>
}
