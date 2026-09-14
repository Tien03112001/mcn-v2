import { QuestionSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Subject from '#models/subject'
import Topic from '#models/topic'
import User from '#models/user'
import QuestionOption from '#models/question_option'
import QuestionPart from '#models/question_part'
import FileAttachment from '#models/file_attachment'

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false_group' | 'short_answer'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export interface MultipleChoiceAnswerConfig {
  scoringMode: 'all_or_nothing'
}

export interface TrueFalseGroupAnswerConfig {
  /** Score ratio indexed by number of correctly answered parts (0..4). */
  partialScoring: [number, number, number, number, number]
}

export interface ShortAnswerConfigNumber {
  answerType: 'number'
  correctValue: number
  tolerance: number
  acceptedAlternatives?: string[]
}

export interface ShortAnswerConfigString {
  answerType: 'string'
  correctValue: string
  caseSensitive?: boolean
  trim?: boolean
  acceptedAlternatives?: string[]
}

export type AnswerConfig =
  | Record<string, never>
  | MultipleChoiceAnswerConfig
  | TrueFalseGroupAnswerConfig
  | ShortAnswerConfigNumber
  | ShortAnswerConfigString

export default class Question extends QuestionSchema {
  declare questionType: QuestionType
  declare difficulty: QuestionDifficulty
  declare answerConfig: AnswerConfig

  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>

  @belongsTo(() => Topic)
  declare topic: BelongsTo<typeof Topic>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => QuestionOption, { onQuery: (query) => query.orderBy('order_index', 'asc') })
  declare options: HasMany<typeof QuestionOption>

  @hasMany(() => QuestionPart, { onQuery: (query) => query.orderBy('order_index', 'asc') })
  declare parts: HasMany<typeof QuestionPart>

  @hasMany(() => FileAttachment, { foreignKey: 'questionId' })
  declare attachments: HasMany<typeof FileAttachment>
}
