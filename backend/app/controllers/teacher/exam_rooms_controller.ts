import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import ExamRoom from '#models/exam_room'
import { createExamRoomValidator, updateExamRoomValidator } from '#validators/exam_room'

async function loadOwnedExam(examId: number, authUser: HttpContext['authUser']) {
  const exam = await Exam.find(examId)
  if (!exam || (authUser.role === 'teacher' && exam.createdBy !== authUser.id)) {
    return null
  }
  return exam
}

export default class ExamRoomsController {
  async index({ params, authUser, response }: HttpContext) {
    const exam = await loadOwnedExam(Number(params.id), authUser)
    if (!exam) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const rooms = await ExamRoom.query().where('exam_id', exam.id).orderBy('opens_at', 'asc')
    return {
      data: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        opensAt: room.opensAt,
        closesAt: room.closesAt,
      })),
    }
  }

  async store({ params, request, authUser, response }: HttpContext) {
    const exam = await loadOwnedExam(Number(params.id), authUser)
    if (!exam) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }
    if (exam.status !== 'published') {
      return response.conflict({ error: { code: 'EXAM_NOT_PUBLISHED' } })
    }

    const { name, opensAt, closesAt } = await request.validateUsing(createExamRoomValidator)
    if (closesAt <= opensAt) {
      return response.badRequest({ error: { code: 'INVALID_SCHEDULE' } })
    }

    const room = await ExamRoom.create({
      examId: exam.id,
      name,
      opensAt,
      closesAt,
      createdBy: authUser.id,
    })

    return response.created({
      data: { id: room.id, name: room.name, opensAt: room.opensAt, closesAt: room.closesAt },
    })
  }

  async update({ params, request, authUser, response }: HttpContext) {
    const exam = await loadOwnedExam(Number(params.id), authUser)
    if (!exam) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const room = await ExamRoom.query().where('id', params.roomId).where('exam_id', exam.id).first()
    if (!room) {
      return response.notFound({ error: { code: 'EXAM_ROOM_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateExamRoomValidator)
    const opensAt = data.opensAt ?? room.opensAt
    const closesAt = data.closesAt ?? room.closesAt
    if (closesAt <= opensAt) {
      return response.badRequest({ error: { code: 'INVALID_SCHEDULE' } })
    }

    room.merge(data)
    await room.save()

    return {
      data: { id: room.id, name: room.name, opensAt: room.opensAt, closesAt: room.closesAt },
    }
  }

  async destroy({ params, authUser, response }: HttpContext) {
    const exam = await loadOwnedExam(Number(params.id), authUser)
    if (!exam) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const room = await ExamRoom.query().where('id', params.roomId).where('exam_id', exam.id).first()
    if (!room) {
      return response.notFound({ error: { code: 'EXAM_ROOM_NOT_FOUND' } })
    }

    try {
      await room.delete()
    } catch {
      return response.conflict({ error: { code: 'ROOM_HAS_ATTEMPTS' } })
    }

    return response.noContent()
  }
}
