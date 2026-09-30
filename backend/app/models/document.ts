import { DocumentSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Subject from '#models/subject'

export default class Document extends DocumentSchema {
  /**
   * Postgres bigint columns round-trip as strings — sizeBytes is a plain
   * number|null everywhere else, read/write through this accessor.
   */
  get sizeBytesNumber(): number | null {
    return this.sizeBytes === null ? null : Number(this.sizeBytes)
  }
  set sizeBytesNumber(value: number | null) {
    this.sizeBytes = value === null ? null : (value as unknown as typeof this.sizeBytes)
  }

  @belongsTo(() => User, { foreignKey: 'uploadedBy' })
  declare uploader: BelongsTo<typeof User>

  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>
}
