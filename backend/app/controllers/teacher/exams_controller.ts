import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Exam from '#models/exam'
import ExamTransformer from '#transformers/exam_transformer'
import { createExamValidator, updateExamValidator } from '#validators/exam'

export default class ExamsController {
  async index({ request, authUser, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)

    const query = Exam.query().preload('tags').orderBy('id', 'desc')
    if (authUser.role === 'teacher') {
      query.where('created_by', authUser.id)
    }

    const exams = await query.paginate(page, perPage)
    return serialize(ExamTransformer.paginate(exams.all(), exams.getMeta()))
  }

  async store({ request, authUser, response, serialize }: HttpContext) {
    const { tagIds, ...data } = await request.validateUsing(createExamValidator)

    const exam = await db.transaction(async (trx) => {
      const e = new Exam()
      e.useTransaction(trx)
      e.subjectId = data.subjectId
      e.createdBy = authUser.id
      e.title = data.title
      e.description = data.description ?? null
      e.durationMinutes = data.durationMinutes
      e.totalScoreNumber = data.totalScore ?? 100
      e.maxViolationCount = data.maxViolationCount ?? 3
      e.status = 'draft'
      e.generationMode = 'manual'
      await e.save()

      if (tagIds?.length) {
        await e.related('tags').attach(tagIds, trx)
      }

      return e
    })

    await exam.load('tags')
    return response.created(await serialize(ExamTransformer.transform(exam)))
  }

  async show({ params, authUser, response, serialize }: HttpContext) {
    const exam = await Exam.query()
      .where('id', params.id)
      .preload('tags')
      .preload('examQuestions', (q) => q.preload('question'))
      .first()

    if (!exam || (authUser.role === 'teacher' && exam.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    return serialize(ExamTransformer.transform(exam).useVariant('toWithQuestions'))
  }

  async update({ params, request, authUser, response, serialize }: HttpContext) {
    const exam = await Exam.find(params.id)
    if (!exam || (authUser.role === 'teacher' && exam.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }
    if (exam.status !== 'draft') {
      return response.conflict({ error: { code: 'EXAM_NOT_EDITABLE', message: 'Only draft exams can be edited' } })
    }

    const { tagIds, ...data } = await request.validateUsing(updateExamValidator)

    await db.transaction(async (trx) => {
      exam.useTransaction(trx)
      exam.merge({
        subjectId: data.subjectId,
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        maxViolationCount: data.maxViolationCount,
      })
      if (data.totalScore !== undefined) {
        exam.totalScoreNumber = data.totalScore
      }
      await exam.save()

      if (tagIds) {
        await exam.related('tags').sync(tagIds, true, trx)
      }
    })

    await exam.load('tags')
    return serialize(ExamTransformer.transform(exam))
  }

  async destroy({ params, authUser, response }: HttpContext) {
    const exam = await Exam.find(params.id)
    if (!exam || (authUser.role === 'teacher' && exam.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    await exam.delete()
    return response.noContent()
  }

  async publish({ params, authUser, response, serialize }: HttpContext) {
    const exam = await Exam.query().where('id', params.id).preload('examQuestions').first()
    if (!exam || (authUser.role === 'teacher' && exam.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    if (exam.status !== 'draft') {
      return response.conflict({ error: { code: 'EXAM_ALREADY_PUBLISHED' } })
    }

    if (exam.examQuestions.length === 0) {
      return response.badRequest({ error: { code: 'EXAM_HAS_NO_QUESTIONS' } })
    }

    await db.transaction(async (trx) => {
      exam.useTransaction(trx)
      exam.status = 'published'
      await exam.save()

      // Default variant using the original question/option order — the
      // matrix-random generator (milestone: future) will create
      // additional variants with populated order maps.
      await exam.related('variants').create(
        {
          variantCode: 'GOC',
          questionOrderMap: null,
          optionOrderMap: null,
        },
        { client: trx }
      )
    })

    return serialize(ExamTransformer.transform(exam))
  }
}
