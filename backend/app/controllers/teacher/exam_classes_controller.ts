import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import ExamClass from '#models/exam_class'
import TeacherClass from '#models/teacher_class'
import { assignExamClassValidator, updateExamClassValidator } from '#validators/exam'

async function assertTeacherOwnsClass(authUser: HttpContext['authUser'], classId: number) {
  if (authUser.role === 'admin') return true
  const assignment = await TeacherClass.query()
    .where('teacher_id', authUser.id)
    .where('class_id', classId)
    .first()
  return Boolean(assignment)
}

export default class ExamClassesController {
  async index({ params, response }: HttpContext) {
    const exam = await Exam.find(params.id)
    if (!exam) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const examClasses = await ExamClass.query().where('exam_id', exam.id).preload('class')
    return {
      data: examClasses.map((ec) => ({
        id: ec.id,
        classId: ec.classId,
        className: ec.class.name,
        opensAt: ec.opensAt,
        closesAt: ec.closesAt,
      })),
    }
  }

  async store({ params, request, authUser, response }: HttpContext) {
    const exam = await Exam.find(params.id)
    if (!exam || (authUser.role === 'teacher' && exam.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }
    if (exam.status !== 'published') {
      return response.conflict({ error: { code: 'EXAM_NOT_PUBLISHED' } })
    }

    const { classId, opensAt, closesAt } = await request.validateUsing(assignExamClassValidator)

    if (!(await assertTeacherOwnsClass(authUser, classId))) {
      return response.forbidden({ error: { code: 'NOT_YOUR_CLASS' } })
    }

    if (closesAt <= opensAt) {
      return response.badRequest({ error: { code: 'INVALID_SCHEDULE' } })
    }

    const existing = await ExamClass.query().where('exam_id', exam.id).where('class_id', classId).first()
    if (existing) {
      return response.conflict({ error: { code: 'CLASS_ALREADY_ASSIGNED' } })
    }

    const examClass = await ExamClass.create({
      examId: exam.id,
      classId,
      opensAt,
      closesAt,
      assignedBy: authUser.id,
    })

    return { data: { id: examClass.id, classId, opensAt, closesAt } }
  }

  async update({ params, request, authUser, response }: HttpContext) {
    const examClass = await ExamClass.query()
      .where('id', params.examClassId)
      .where('exam_id', params.id)
      .first()
    if (!examClass) {
      return response.notFound({ error: { code: 'EXAM_CLASS_NOT_FOUND' } })
    }

    if (!(await assertTeacherOwnsClass(authUser, examClass.classId))) {
      return response.forbidden({ error: { code: 'NOT_YOUR_CLASS' } })
    }

    const data = await request.validateUsing(updateExamClassValidator)
    const opensAt = data.opensAt ?? examClass.opensAt
    const closesAt = data.closesAt ?? examClass.closesAt
    if (closesAt <= opensAt) {
      return response.badRequest({ error: { code: 'INVALID_SCHEDULE' } })
    }

    examClass.merge(data)
    await examClass.save()

    return { data: { id: examClass.id, opensAt: examClass.opensAt, closesAt: examClass.closesAt } }
  }

  async destroy({ params, authUser, response }: HttpContext) {
    const examClass = await ExamClass.query()
      .where('id', params.examClassId)
      .where('exam_id', params.id)
      .first()
    if (!examClass) {
      return response.notFound({ error: { code: 'EXAM_CLASS_NOT_FOUND' } })
    }

    if (!(await assertTeacherOwnsClass(authUser, examClass.classId))) {
      return response.forbidden({ error: { code: 'NOT_YOUR_CLASS' } })
    }

    await examClass.delete()
    return response.noContent()
  }
}
