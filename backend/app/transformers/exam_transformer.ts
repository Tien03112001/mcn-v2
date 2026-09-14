import type Exam from '#models/exam'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ExamTransformer extends BaseTransformer<Exam> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'subjectId',
        'createdBy',
        'title',
        'description',
        'durationMinutes',
        'maxViolationCount',
        'shuffleQuestions',
        'shuffleOptions',
        'generationMode',
        'status',
        'createdAt',
        'updatedAt',
      ]),
      totalScore: this.resource.totalScoreNumber,
      tags: this.resource.tags?.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    }
  }

  toWithQuestions() {
    return {
      ...this.toObject(),
      questions: this.resource.examQuestions?.map((eq) => ({
        examQuestionId: eq.id,
        questionId: eq.questionId,
        orderIndex: eq.orderIndex,
        score: eq.scoreNumber,
        question: eq.question
          ? {
              id: eq.question.id,
              questionType: eq.question.questionType,
              difficulty: eq.question.difficulty,
              content: eq.question.content,
            }
          : undefined,
      })),
    }
  }
}
