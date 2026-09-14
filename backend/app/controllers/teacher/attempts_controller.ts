import type { HttpContext } from '@adonisjs/core/http'
import Exam from '#models/exam'
import ExamAttempt from '#models/exam_attempt'
import ExamAttemptAnswer from '#models/exam_attempt_answer'

async function assertOwnsExam(examId: number, authUser: HttpContext['authUser']) {
  const exam = await Exam.find(examId)
  if (!exam) return null
  if (authUser.role === 'teacher' && exam.createdBy !== authUser.id) return null
  return exam
}

export default class AttemptsController {
  /** Lists every student attempt for one exam, across all assigned classes. */
  async forExam({ params, authUser, response, serialize }: HttpContext) {
    const exam = await assertOwnsExam(Number(params.id), authUser)
    if (!exam) {
      return response.notFound({ error: { code: 'EXAM_NOT_FOUND' } })
    }

    const attempts = await ExamAttempt.query()
      .whereHas('examClass', (q) => q.where('exam_id', exam.id))
      .preload('student')
      .preload('examClass', (q) => q.preload('class'))
      .orderBy('created_at', 'desc')

    return serialize(
      attempts.map((a) => ({
        attemptId: a.id,
        studentId: a.studentId,
        studentName: a.student.fullName,
        className: a.examClass.class.name,
        status: a.status,
        score: a.scoreNumber,
        violationCount: a.violationCount,
        isFlagged: a.isFlagged,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
      }))
    )
  }

  /** Full detail of one student's attempt, including per-question answers. */
  async show({ params, authUser, response, serialize }: HttpContext) {
    const attempt = await ExamAttempt.query()
      .where('id', params.attemptId)
      .preload('student')
      .preload('examClass', (q) => q.preload('exam'))
      .first()

    if (!attempt) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }
    if (authUser.role === 'teacher' && attempt.examClass.exam.createdBy !== authUser.id) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }

    const answers = await ExamAttemptAnswer.query()
      .where('exam_attempt_id', attempt.id)
      .preload('question')

    return serialize({
      attemptId: attempt.id,
      studentName: attempt.student.fullName,
      status: attempt.status,
      score: attempt.scoreNumber,
      violationCount: attempt.violationCount,
      isFlagged: attempt.isFlagged,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        content: a.question.content,
        questionType: a.question.questionType,
        answerPayload: a.answerPayload,
        isCorrect: a.isCorrect,
        scoreAwarded: a.scoreAwardedNumber,
      })),
    })
  }

  /** Proctoring violation timeline for one attempt. */
  async violations({ params, authUser, response, serialize }: HttpContext) {
    const attempt = await ExamAttempt.query()
      .where('id', params.attemptId)
      .preload('examClass', (q) => q.preload('exam'))
      .preload('violations')
      .first()

    if (!attempt) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }
    if (authUser.role === 'teacher' && attempt.examClass.exam.createdBy !== authUser.id) {
      return response.notFound({ error: { code: 'ATTEMPT_NOT_FOUND' } })
    }

    return serialize(
      attempt.violations.map((v) => ({
        id: v.id,
        violationType: v.violationType,
        occurredAt: v.occurredAt,
        clientReportedAt: v.clientReportedAt,
      }))
    )
  }
}
