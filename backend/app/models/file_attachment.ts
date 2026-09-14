import { FileAttachmentSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Question from '#models/question'
import User from '#models/user'

export default class FileAttachment extends FileAttachmentSchema {
  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  @belongsTo(() => User, { foreignKey: 'uploadedBy' })
  declare uploader: BelongsTo<typeof User>
}
