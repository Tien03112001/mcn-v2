import { QuestionPartSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Question from '#models/question'

export default class QuestionPart extends QuestionPartSchema {
  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>
}
