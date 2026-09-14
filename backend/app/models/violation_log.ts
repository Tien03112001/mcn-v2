import { ViolationLogSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ExamAttempt from '#models/exam_attempt'

export type ViolationType = 'tab_hidden' | 'window_blur' | 'fullscreen_exit'

export default class ViolationLog extends ViolationLogSchema {
  declare violationType: ViolationType

  @belongsTo(() => ExamAttempt)
  declare examAttempt: BelongsTo<typeof ExamAttempt>
}
