import { ExamSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Subject from '#models/subject'
import User from '#models/user'
import Tag from '#models/tag'
import ExamQuestion from '#models/exam_question'
import ExamVariant from '#models/exam_variant'
import ExamClass from '#models/exam_class'
import FileAttachment from '#models/file_attachment'

export type ExamStatus = 'draft' | 'published' | 'archived'
export type ExamGenerationMode = 'manual' | 'matrix_random'

export default class Exam extends ExamSchema {
  declare status: ExamStatus
  declare generationMode: ExamGenerationMode

  /**
   * Postgres numeric/decimal columns round-trip as strings (to avoid
   * float precision loss) — totalScore is a plain number everywhere else,
   * so read/write through this getter/setter instead of the raw column.
   */
  get totalScoreNumber(): number {
    return Number(this.totalScore)
  }
  set totalScoreNumber(value: number) {
    this.totalScore = String(value) as unknown as typeof this.totalScore
  }

  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @manyToMany(() => Tag, { pivotTable: 'exam_tags' })
  declare tags: ManyToMany<typeof Tag>

  @hasMany(() => ExamQuestion, { onQuery: (query) => query.orderBy('order_index', 'asc') })
  declare examQuestions: HasMany<typeof ExamQuestion>

  @hasMany(() => ExamVariant)
  declare variants: HasMany<typeof ExamVariant>

  @hasMany(() => ExamClass)
  declare examClasses: HasMany<typeof ExamClass>

  @hasMany(() => FileAttachment, { foreignKey: 'examId' })
  declare attachments: HasMany<typeof FileAttachment>
}
