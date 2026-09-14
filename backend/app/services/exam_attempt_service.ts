import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import ExamClass from '#models/exam_class'
import ExamAttempt from '#models/exam_attempt'
import ExamAttemptAnswer from '#models/exam_attempt_answer'
import ExamQuestion from '#models/exam_question'
import GradingService, { type AnswerPayload } from '#services/grading_service'

export class ExamAttemptError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
  }
}

export default class ExamAttemptService {
  /**
   * Starts a new attempt for a student against an exam assigned to their
   * class. All eligibility checks (enrollment, opens/closes window, no
   * existing attempt) run inside a transaction to close the race window
   * a double-click/double-tab submit could otherwise exploit.
   */
  static async start(examClassId: number, studentId: number): Promise<ExamAttempt> {
    return db.transaction(async (trx) => {
      const examClass = await ExamClass.query({ client: trx })
        .where('id', examClassId)
        .preload('exam', (q) => q.preload('variants'))
        .forUpdate()
        .first()

      if (!examClass) {
        throw new ExamAttemptError('EXAM_CLASS_NOT_FOUND', 'Exam is not assigned to your class')
      }

      const isEnrolled = await db
        .from('class_students')
        .where('class_id', examClass.classId)
        .where('student_id', studentId)
        .useTransaction(trx)
        .first()
      if (!isEnrolled) {
        throw new ExamAttemptError('NOT_ENROLLED', 'You are not enrolled in this class')
      }

      const now = DateTime.now()
      if (now < examClass.opensAt) {
        throw new ExamAttemptError('EXAM_NOT_OPEN_YET', 'This exam has not opened yet')
      }
      if (now > examClass.closesAt) {
        throw new ExamAttemptError('EXAM_CLOSED', 'This exam is closed')
      }

      const existing = await ExamAttempt.query({ client: trx })
        .where('exam_class_id', examClassId)
        .where('student_id', studentId)
        .first()
      if (existing) {
        throw new ExamAttemptError('ATTEMPT_ALREADY_EXISTS', 'You have already started or completed this exam')
      }

      const variant = examClass.exam.variants[0]
      if (!variant) {
        throw new ExamAttemptError('EXAM_HAS_NO_VARIANT', 'Exam has not been published correctly')
      }

      const deadlineAt = now.plus({ minutes: examClass.exam.durationMinutes })

      const attempt = new ExamAttempt()
      attempt.useTransaction(trx)
      attempt.examClassId = examClassId
      attempt.examVariantId = variant.id
      attempt.studentId = studentId
      attempt.startedAt = now
      attempt.deadlineAt = deadlineAt
      attempt.status = 'in_progress'
      attempt.violationCount = 0
      attempt.isFlagged = false
      await attempt.save()

      return attempt
    })
  }

  /**
   * Returns the question list for an attempt in exam order, correct
   * answers stripped out — safe to send to the student while in progress.
   */
  static async questionsForAttempt(attempt: ExamAttempt) {
    const examClass = await ExamClass.query().where('id', attempt.examClassId).firstOrFail()

    const examQuestions = await ExamQuestion.query()
      .where('exam_id', examClass.examId)
      .preload('question', (q) => q.preload('options').preload('parts'))
      .orderBy('order_index', 'asc')

    return examQuestions.map((eq) => ({
      questionId: eq.questionId,
      orderIndex: eq.orderIndex,
      score: eq.scoreNumber,
      questionType: eq.question.questionType,
      content: eq.question.content,
      options: eq.question.options.map((o) => ({ id: o.id, label: o.label, content: o.content })),
      parts: eq.question.parts.map((p) => ({ label: p.label, content: p.content })),
    }))
  }

  /**
   * Autosaves a single answer. Rejected once the attempt is no longer
   * in progress or the deadline has passed — the server clock is the
   * only source of truth, never the client's.
   */
  static async saveAnswer(attempt: ExamAttempt, questionId: number, payload: AnswerPayload): Promise<void> {
    this.#assertMutable(attempt)

    await ExamAttemptAnswer.updateOrCreate(
      { examAttemptId: attempt.id, questionId },
      { answerPayload: payload, answeredAt: DateTime.now() }
    )
  }

  /**
   * Grades every saved answer and locks the attempt. Runs inside a
   * transaction with a row lock so a violation-triggered auto-submit
   * racing a manual submit can't both succeed.
   */
  static async submit(
    attemptId: number,
    finalStatus: 'submitted' | 'auto_submitted' | 'expired' = 'submitted'
  ): Promise<ExamAttempt> {
    return db.transaction(async (trx) => {
      const attempt = await ExamAttempt.query({ client: trx }).where('id', attemptId).forUpdate().first()
      if (!attempt) {
        throw new ExamAttemptError('ATTEMPT_NOT_FOUND', 'Attempt not found')
      }
      if (attempt.status !== 'in_progress') {
        throw new ExamAttemptError('ATTEMPT_ALREADY_CLOSED', 'This attempt has already been closed')
      }

      const examClass = await ExamClass.query({ client: trx }).where('id', attempt.examClassId).firstOrFail()

      const examQuestions = await ExamQuestion.query({ client: trx })
        .where('exam_id', examClass.examId)
        .preload('question', (q) => q.preload('options').preload('parts'))

      const answers = await ExamAttemptAnswer.query({ client: trx }).where('exam_attempt_id', attempt.id)
      const answerByQuestionId = new Map(answers.map((a) => [a.questionId, a]))

      let totalScore = 0

      for (const eq of examQuestions) {
        const question = eq.question

        const answer = answerByQuestionId.get(eq.questionId)
        const maxScore = eq.scoreNumber

        const result = answer
          ? await GradingService.grade(question, answer.answerPayload, maxScore)
          : { isCorrect: false, scoreAwarded: 0 }

        totalScore += result.scoreAwarded

        if (answer) {
          answer.useTransaction(trx)
          answer.isCorrect = result.isCorrect
          answer.scoreAwardedNumber = result.scoreAwarded
          await answer.save()
        } else {
          const newAnswer = new ExamAttemptAnswer()
          newAnswer.useTransaction(trx)
          newAnswer.examAttemptId = attempt.id
          newAnswer.questionId = eq.questionId
          newAnswer.answerPayload = { rawValue: null }
          newAnswer.isCorrect = false
          newAnswer.scoreAwardedNumber = 0
          newAnswer.answeredAt = DateTime.now()
          await newAnswer.save()
        }
      }

      attempt.status = finalStatus
      attempt.submittedAt = DateTime.now()
      attempt.scoreNumber = Math.round(totalScore * 100) / 100
      await attempt.save()

      return attempt
    })
  }

  static #assertMutable(attempt: ExamAttempt): void {
    if (attempt.status !== 'in_progress') {
      throw new ExamAttemptError('ATTEMPT_ALREADY_CLOSED', 'This attempt has already been closed')
    }
    if (DateTime.now() > attempt.deadlineAt) {
      throw new ExamAttemptError('ATTEMPT_EXPIRED', 'Time is up for this attempt')
    }
  }
}
