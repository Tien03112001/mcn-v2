import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import ExamQuestion from '#models/exam_question'
import Question from '#models/question'
import { addExamQuestionValidator, updateExamQuestionValidator } from '#validators/exam'

async function loadOwnedDraftExam(examId: number, authUser: HttpContext['authUser']) {
  const exam = await Exam.find(examId)
  if (!exam || (authUser.role === 'teacher' && exam.createdBy !== authUser.id)) {
    return { exam: null, error: { code: 'EXAM_NOT_FOUND' as const, status: 404 } }
  }
  if (exam.status !== 'draft') {
    return {
      exam: null,
      error: { code: 'EXAM_NOT_EDITABLE' as const, status: 409 },
    }
  }
  return { exam, error: null }
}

export default class ExamQuestionsController {
  async index({ params, serialize }: HttpContext) {
    const examQuestions = await ExamQuestion.query()
      .where('exam_id', params.id)
      .preload('question')
      .orderBy('order_index', 'asc')

    return serialize(
      examQuestions.map((eq) => ({
        examQuestionId: eq.id,
        questionId: eq.questionId,
        orderIndex: eq.orderIndex,
        score: eq.scoreNumber,
        question: {
          id: eq.question.id,
          questionType: eq.question.questionType,
          difficulty: eq.question.difficulty,
          content: eq.question.content,
        },
      }))
    )
  }

  async store({ params, request, authUser, response }: HttpContext) {
    const { exam, error } = await loadOwnedDraftExam(params.id, authUser)
    if (!exam) {
      return response.status(error!.status).send({ error: { code: error!.code } })
    }

    const { questionId, score } = await request.validateUsing(addExamQuestionValidator)

    const question = await Question.find(questionId)
    if (!question) {
      return response.notFound({ error: { code: 'QUESTION_NOT_FOUND' } })
    }

    const existing = await ExamQuestion.query()
      .where('exam_id', exam.id)
      .where('question_id', questionId)
      .first()
    if (existing) {
      return response.conflict({ error: { code: 'QUESTION_ALREADY_IN_EXAM' } })
    }

    const maxOrder = await ExamQuestion.query()
      .where('exam_id', exam.id)
      .max('order_index as max')
      .first()
    const nextOrder = ((maxOrder?.$extras.max as number | null) ?? -1) + 1

    const examQuestion = new ExamQuestion()
    examQuestion.examId = exam.id
    examQuestion.questionId = questionId
    examQuestion.scoreNumber = score
    examQuestion.orderIndex = nextOrder
    await examQuestion.save()

    return { data: { examQuestionId: examQuestion.id, questionId, orderIndex: nextOrder, score } }
  }

  async update({ params, request, authUser, response }: HttpContext) {
    const { exam, error } = await loadOwnedDraftExam(params.id, authUser)
    if (!exam) {
      return response.status(error!.status).send({ error: { code: error!.code } })
    }

    const examQuestion = await ExamQuestion.query()
      .where('id', params.examQuestionId)
      .where('exam_id', exam.id)
      .first()
    if (!examQuestion) {
      return response.notFound({ error: { code: 'EXAM_QUESTION_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateExamQuestionValidator)
    if (data.orderIndex !== undefined) {
      examQuestion.orderIndex = data.orderIndex
    }
    if (data.score !== undefined) {
      examQuestion.scoreNumber = data.score
    }
    await examQuestion.save()

    return {
      data: {
        examQuestionId: examQuestion.id,
        orderIndex: examQuestion.orderIndex,
        score: examQuestion.scoreNumber,
      },
    }
  }

  async destroy({ params, authUser, response }: HttpContext) {
    const { exam, error } = await loadOwnedDraftExam(params.id, authUser)
    if (!exam) {
      return response.status(error!.status).send({ error: { code: error!.code } })
    }

    const examQuestion = await ExamQuestion.query()
      .where('id', params.examQuestionId)
      .where('exam_id', exam.id)
      .first()
    if (!examQuestion) {
      return response.notFound({ error: { code: 'EXAM_QUESTION_NOT_FOUND' } })
    }

    await examQuestion.delete()
    return response.noContent()
  }
}
