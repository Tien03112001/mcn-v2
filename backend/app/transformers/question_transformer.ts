import type Question from '#models/question'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Full transformer, including correct answers (is_correct flags,
 * answer_config). Only ever exposed to teachers/admins managing the
 * question bank — never sent to a student mid-attempt.
 */
export default class QuestionTransformer extends BaseTransformer<Question> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'subjectId',
      'topicId',
      'createdBy',
      'questionType',
      'difficulty',
      'content',
      'explanation',
      'answerConfig',
      'isActive',
      'createdAt',
      'updatedAt',
    ])
  }

  toWithDetails() {
    return {
      ...this.toObject(),
      options: this.resource.options?.map((o) => ({
        id: o.id,
        label: o.label,
        content: o.content,
        isCorrect: o.isCorrect,
        orderIndex: o.orderIndex,
      })),
      parts: this.resource.parts?.map((p) => ({
        id: p.id,
        label: p.label,
        content: p.content,
        isCorrect: p.isCorrect,
        orderIndex: p.orderIndex,
      })),
    }
  }
}
