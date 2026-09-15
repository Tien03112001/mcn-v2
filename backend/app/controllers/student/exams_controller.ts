import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import ExamClass from '#models/exam_class'
import ExamAttempt from '#models/exam_attempt'

export default class ExamsController {
  /**
   * Lists exams assigned to classes the student belongs to, split into
   * upcoming/open/closed based on server time (never the client's).
   */
  async index({ request, authUser }: HttpContext) {
    const status = request.input('status') as 'upcoming' | 'open' | 'closed' | undefined
    const now = DateTime.now()

    const classIds = (
      await db.from('class_students').where('student_id', authUser.id).select('class_id')
    ).map((row) => row.class_id)

    const query = ExamClass.query()
      .whereIn('class_id', classIds)
      .preload('exam', (q) => q.preload('tags'))
      .preload('class')

    if (status === 'upcoming') query.where('opens_at', '>', now.toSQL()!)
    if (status === 'open') query.where('opens_at', '<=', now.toSQL()!).where('closes_at', '>=', now.toSQL()!)
    if (status === 'closed') query.where('closes_at', '<', now.toSQL()!)

    const examClasses = await query.orderBy('opens_at', 'desc')

    const attempts = await ExamAttempt.query()
      .where('student_id', authUser.id)
      .whereIn(
        'exam_class_id',
        examClasses.map((ec) => ec.id)
      )
    const attemptByExamClassId = new Map(attempts.map((a) => [a.examClassId, a]))

    return {
      data: examClasses.map((ec) => ({
        examClassId: ec.id,
        examId: ec.examId,
        title: ec.exam.title,
        subjectId: ec.exam.subjectId,
        durationMinutes: ec.exam.durationMinutes,
        totalScore: ec.exam.totalScoreNumber,
        tags: ec.exam.tags.map((t) => ({ id: t.id, name: t.name })),
        opensAt: ec.opensAt,
        closesAt: ec.closesAt,
        attemptStatus: attemptByExamClassId.get(ec.id)?.status ?? null,
      })),
    }
  }

  async show({ params, authUser, response, serialize }: HttpContext) {
    const examClass = await ExamClass.query()
      .where('id', params.examClassId)
      .preload('exam', (q) => q.preload('tags'))
      .first()

    if (!examClass) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const isEnrolled = await db
      .from('class_students')
      .where('class_id', examClass.classId)
      .where('student_id', authUser.id)
      .first()
    if (!isEnrolled) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const attempt = await ExamAttempt.query()
      .where('exam_class_id', examClass.id)
      .where('student_id', authUser.id)
      .first()

    return serialize({
      examClassId: examClass.id,
      title: examClass.exam.title,
      description: examClass.exam.description,
      durationMinutes: examClass.exam.durationMinutes,
      totalScore: examClass.exam.totalScoreNumber,
      tags: examClass.exam.tags.map((t) => ({ id: t.id, name: t.name })),
      opensAt: examClass.opensAt,
      closesAt: examClass.closesAt,
      attemptStatus: attempt?.status ?? null,
    })
  }
}
