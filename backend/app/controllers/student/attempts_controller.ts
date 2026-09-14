import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ExamAttempt from '#models/exam_attempt'
import ExamAttemptAnswer from '#models/exam_attempt_answer'
import ExamAttemptService, { ExamAttemptError } from '#services/exam_attempt_service'
import ViolationService from '#services/violation_service'
import { saveAnswerValidator, reportViolationValidator } from '#validators/attempt'
import type { AnswerPayload } from '#services/grading_service'

function errorResponse(response: HttpContext['response'], error: ExamAttemptError) {
  const statusByCode: Record<string, number> = {
    EXAM_CLASS_NOT_FOUND: 404,
    NOT_ENROLLED: 403,
    EXAM_NOT_OPEN_YET: 409,
    EXAM_CLOSED: 409,
    ATTEMPT_ALREADY_EXISTS: 409,
    EXAM_HAS_NO_VARIANT: 409,
    ATTEMPT_NOT_FOUND: 404,
    ATTEMPT_ALREADY_CLOSED: 409,
    ATTEMPT_EXPIRED: 409,
  }
  const status = statusByCode[error.code] ?? 400
  return response.status(status).send({ error: { code: error.code, message: error.message } })
}

async function loadOwnAttempt(attemptId: number, studentId: number) {
  return ExamAttempt.query().where('id', attemptId).where('student_id', studentId).first()
}

export default class AttemptsController {
  async start({ params, authUser, response, serialize }: HttpContext) {
    try {
      const attempt = await ExamAttemptService.start(Number(params.examClassId), authUser.id)
      const questions = await ExamAttemptService.questionsForAttempt(attempt)

      return response.created(
        await serialize({
          attemptId: attempt.id,
          startedAt: attempt.startedAt,
          deadlineAt: attempt.deadlineAt,
          questions,
        })
      )
    } catch (error) {
      if (error instanceof ExamAttemptError) {
        return errorResponse(response, error)
      }
      throw error
    }
  }

  async show({ params, authUser, response, serialize }: HttpContext) {
    const attempt = await loadOwnAttempt(Number(params.attemptId), authUser.id)
    if (!attempt) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }

    const questions = await ExamAttemptService.questionsForAttempt(attempt)
    const savedAnswers = await ExamAttemptAnswer.query().where('exam_attempt_id', attempt.id)
    const answersByQuestionId = new Map(savedAnswers.map((a) => [a.questionId, a.answerPayload]))

    return serialize({
      attemptId: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      violationCount: attempt.violationCount,
      questions: questions.map((q) => ({ ...q, savedAnswer: answersByQuestionId.get(q.questionId) ?? null })),
    })
  }

  async saveAnswer({ params, request, authUser, response }: HttpContext) {
    const attempt = await loadOwnAttempt(Number(params.attemptId), authUser.id)
    if (!attempt) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }

    const payload = (await request.validateUsing(saveAnswerValidator)) as AnswerPayload

    try {
      await ExamAttemptService.saveAnswer(attempt, Number(params.questionId), payload)
      return { message: 'Saved' }
    } catch (error) {
      if (error instanceof ExamAttemptError) {
        return errorResponse(response, error)
      }
      throw error
    }
  }

  async reportViolation({ params, request, authUser, response, serialize }: HttpContext) {
    const attempt = await loadOwnAttempt(Number(params.attemptId), authUser.id)
    if (!attempt) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }

    const { violationType, clientReportedAt } = await request.validateUsing(reportViolationValidator)

    try {
      const result = await ViolationService.recordViolation(
        attempt.id,
        violationType ?? 'tab_hidden',
        clientReportedAt ?? null
      )
      return serialize(result)
    } catch (error) {
      if (error instanceof ExamAttemptError) {
        return errorResponse(response, error)
      }
      throw error
    }
  }

  async submit({ params, authUser, response, serialize }: HttpContext) {
    const attempt = await loadOwnAttempt(Number(params.attemptId), authUser.id)
    if (!attempt) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }

    try {
      const finalStatus = DateTime.now() > attempt.deadlineAt ? 'expired' : 'submitted'
      const submitted = await ExamAttemptService.submit(attempt.id, finalStatus)
      return serialize({
        attemptId: submitted.id,
        status: submitted.status,
        score: submitted.scoreNumber,
        submittedAt: submitted.submittedAt,
      })
    } catch (error) {
      if (error instanceof ExamAttemptError) {
        return errorResponse(response, error)
      }
      throw error
    }
  }

  async history({ authUser, serialize }: HttpContext) {
    const attempts = await ExamAttempt.query()
      .where('student_id', authUser.id)
      .preload('examClass', (q) => q.preload('exam'))
      .orderBy('created_at', 'desc')

    return serialize(
      attempts.map((a) => ({
        attemptId: a.id,
        examTitle: a.examClass.exam.title,
        status: a.status,
        score: a.scoreNumber,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
        isFlagged: a.isFlagged,
      }))
    )
  }

  async result({ params, authUser, response, serialize }: HttpContext) {
    const attempt = await loadOwnAttempt(Number(params.attemptId), authUser.id)
    if (!attempt) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }
    if (attempt.status === 'in_progress') {
      return response.conflict({ error: { code: 'ATTEMPT_NOT_SUBMITTED' } })
    }

    const answers = await ExamAttemptAnswer.query()
      .where('exam_attempt_id', attempt.id)
      .preload('question')

    return serialize({
      attemptId: attempt.id,
      status: attempt.status,
      score: attempt.scoreNumber,
      submittedAt: attempt.submittedAt,
      isFlagged: attempt.isFlagged,
      violationCount: attempt.violationCount,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        content: a.question.content,
        questionType: a.question.questionType,
        explanation: a.question.explanation,
        answerPayload: a.answerPayload,
        isCorrect: a.isCorrect,
        scoreAwarded: a.scoreAwardedNumber,
      })),
    })
  }
}
