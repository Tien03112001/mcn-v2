import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Question from '#models/question'
import QuestionOption from '#models/question_option'
import QuestionPart from '#models/question_part'
import QuestionTransformer from '#transformers/question_transformer'
import { createQuestionValidator, updateQuestionValidator } from '#validators/question'

export default class QuestionsController {
  async index({ request, authUser, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)

    const query = Question.query()
      .preload('options')
      .preload('parts')
      .orderBy('id', 'desc')

    if (authUser.role === 'teacher') {
      query.where('created_by', authUser.id)
    }

    const { subjectId, topicId, difficulty, type, keyword } = request.qs()
    if (subjectId) query.where('subject_id', subjectId)
    if (topicId) query.where('topic_id', topicId)
    if (difficulty) query.where('difficulty', difficulty)
    if (type) query.where('question_type', type)
    if (keyword) query.whereILike('content', `%${keyword}%`)

    const questions = await query.paginate(page, perPage)
    return serialize(
      QuestionTransformer.paginate(questions.all(), questions.getMeta()).useVariant('toWithDetails')
    )
  }

  async store({ request, authUser, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createQuestionValidator)

    const question = await db.transaction(async (trx) => {
      const q = new Question()
      q.useTransaction(trx)
      q.subjectId = data.subjectId
      q.topicId = data.topicId ?? null
      q.createdBy = authUser.id
      q.questionType = data.questionType
      q.difficulty = data.difficulty
      q.content = data.content
      q.explanation = data.explanation ?? null
      q.answerConfig = (data.answerConfig ?? {}) as Question['answerConfig']
      q.isActive = true
      await q.save()

      if (data.options?.length) {
        await QuestionOption.createMany(
          data.options.map((o, index) => ({
            questionId: q.id,
            label: o.label,
            content: o.content,
            isCorrect: o.isCorrect,
            orderIndex: index,
          })),
          { client: trx }
        )
      }

      if (data.parts?.length) {
        await QuestionPart.createMany(
          data.parts.map((p, index) => ({
            questionId: q.id,
            label: p.label,
            content: p.content,
            isCorrect: p.isCorrect,
            orderIndex: index,
          })),
          { client: trx }
        )
      }

      return q
    })

    await question.load('options')
    await question.load('parts')

    return response.created(
      await serialize(QuestionTransformer.transform(question).useVariant('toWithDetails'))
    )
  }

  async show({ params, authUser, response, serialize }: HttpContext) {
    const question = await Question.query()
      .where('id', params.id)
      .preload('options')
      .preload('parts')
      .first()

    if (!question || (authUser.role === 'teacher' && question.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'QUESTION_NOT_FOUND' } })
    }

    return serialize(QuestionTransformer.transform(question).useVariant('toWithDetails'))
  }

  async update({ params, request, authUser, response, serialize }: HttpContext) {
    const question = await Question.find(params.id)
    if (!question || (authUser.role === 'teacher' && question.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'QUESTION_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateQuestionValidator)

    await db.transaction(async (trx) => {
      question.useTransaction(trx)
      question.merge({
        subjectId: data.subjectId,
        topicId: data.topicId,
        difficulty: data.difficulty,
        content: data.content,
        explanation: data.explanation,
        isActive: data.isActive,
        answerConfig: data.answerConfig as Question['answerConfig'] | undefined,
      })
      await question.save()

      if (data.options) {
        await QuestionOption.query({ client: trx }).where('question_id', question.id).delete()
        await QuestionOption.createMany(
          data.options.map((o, index) => ({
            questionId: question.id,
            label: o.label,
            content: o.content,
            isCorrect: o.isCorrect,
            orderIndex: index,
          })),
          { client: trx }
        )
      }

      if (data.parts) {
        await QuestionPart.query({ client: trx }).where('question_id', question.id).delete()
        await QuestionPart.createMany(
          data.parts.map((p, index) => ({
            questionId: question.id,
            label: p.label,
            content: p.content,
            isCorrect: p.isCorrect,
            orderIndex: index,
          })),
          { client: trx }
        )
      }
    })

    await question.load('options')
    await question.load('parts')

    return serialize(QuestionTransformer.transform(question).useVariant('toWithDetails'))
  }

  async destroy({ params, authUser, response }: HttpContext) {
    const question = await Question.find(params.id)
    if (!question || (authUser.role === 'teacher' && question.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'QUESTION_NOT_FOUND' } })
    }

    await question.delete()
    return response.noContent()
  }
}
