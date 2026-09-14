import { TopicSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Subject from '#models/subject'

export default class Topic extends TopicSchema {
  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>
}
