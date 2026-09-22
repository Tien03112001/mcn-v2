import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import ExamRoom from '#models/exam_room'
import ExamAttempt from '#models/exam_attempt'

export default class ExamsController {
  /**
   * Lists exams for the rooms the student belongs to, split into
   * upcoming/open/closed based on server time (never the client's).
   */
  async index({ request, authUser }: HttpContext) {
    const status = request.input('status') as 'upcoming' | 'open' | 'closed' | undefined
    const now = DateTime.now()

    const roomStudentRows = await db
      .from('exam_room_students')
      .where('student_id', authUser.id)
      .select('exam_room_id')
    const roomIds = roomStudentRows.map((row) => row.exam_room_id)

    const query = ExamRoom.query()
      .whereIn('id', roomIds)
      .preload('exam', (q) => q.preload('tags'))

    if (status === 'upcoming') query.where('opens_at', '>', now.toSQL()!)
    if (status === 'open')
      query.where('opens_at', '<=', now.toSQL()!).where('closes_at', '>=', now.toSQL()!)
    if (status === 'closed') query.where('closes_at', '<', now.toSQL()!)

    const examRooms = await query.orderBy('opens_at', 'desc')

    const attempts = await ExamAttempt.query()
      .where('student_id', authUser.id)
      .whereIn(
        'exam_room_id',
        examRooms.map((room) => room.id)
      )
    const attemptByExamRoomId = new Map(attempts.map((a) => [a.examRoomId, a]))

    return {
      data: examRooms.map((room) => ({
        examRoomId: room.id,
        examId: room.examId,
        title: room.exam.title,
        subjectId: room.exam.subjectId,
        durationMinutes: room.exam.durationMinutes,
        totalScore: room.exam.totalScoreNumber,
        tags: room.exam.tags.map((t) => ({ id: t.id, name: t.name })),
        opensAt: room.opensAt,
        closesAt: room.closesAt,
        attemptStatus: attemptByExamRoomId.get(room.id)?.status ?? null,
      })),
    }
  }

  async show({ params, authUser, response, serialize }: HttpContext) {
    const examRoom = await ExamRoom.query()
      .where('id', params.examRoomId)
      .preload('exam', (q) => q.preload('tags'))
      .first()

    if (!examRoom) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const isInRoom = await db
      .from('exam_room_students')
      .where('exam_room_id', examRoom.id)
      .where('student_id', authUser.id)
      .first()
    if (!isInRoom) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const attempt = await ExamAttempt.query()
      .where('exam_room_id', examRoom.id)
      .where('student_id', authUser.id)
      .first()

    return serialize({
      examRoomId: examRoom.id,
      title: examRoom.exam.title,
      description: examRoom.exam.description,
      durationMinutes: examRoom.exam.durationMinutes,
      totalScore: examRoom.exam.totalScoreNumber,
      tags: examRoom.exam.tags.map((t) => ({ id: t.id, name: t.name })),
      opensAt: examRoom.opensAt,
      closesAt: examRoom.closesAt,
      attemptStatus: attempt?.status ?? null,
    })
  }
}
