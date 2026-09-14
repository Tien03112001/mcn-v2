import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import ExamAttempt from '#models/exam_attempt'
import ExamClass from '#models/exam_class'
import ViolationLog, { type ViolationType } from '#models/violation_log'
import ExamAttemptService, { ExamAttemptError } from '#services/exam_attempt_service'

export interface ViolationResult {
  violationCount: number
  maxViolationCount: number
  autoSubmitted: boolean
}

export default class ViolationService {
  /**
   * Records one proctoring violation (e.g. the student left the exam
   * tab) and auto-submits the attempt once the configured threshold is
   * reached. The violation count and the auto-submit decision are both
   * computed server-side — the client only reports the event, it never
   * decides the outcome.
   */
  static async recordViolation(
    attemptId: number,
    violationType: ViolationType,
    clientReportedAt: DateTime | null
  ): Promise<ViolationResult> {
    return db.transaction(async (trx) => {
      const attempt = await ExamAttempt.query({ client: trx }).where('id', attemptId).forUpdate().first()
      if (!attempt) {
        throw new ExamAttemptError('ATTEMPT_NOT_FOUND', 'Attempt not found')
      }
      if (attempt.status !== 'in_progress') {
        throw new ExamAttemptError('ATTEMPT_ALREADY_CLOSED', 'This attempt has already been closed')
      }

      const examClass = await ExamClass.query({ client: trx })
        .where('id', attempt.examClassId)
        .preload('exam')
        .firstOrFail()
      const maxViolationCount = examClass.exam.maxViolationCount

      await ViolationLog.create(
        {
          examAttemptId: attempt.id,
          violationType,
          occurredAt: DateTime.now(),
          clientReportedAt,
          metadata: null,
        },
        { client: trx }
      )

      attempt.violationCount += 1
      await attempt.save()

      const shouldAutoSubmit = attempt.violationCount >= maxViolationCount

      if (shouldAutoSubmit) {
        attempt.isFlagged = true
        await attempt.save()
      }

      return {
        violationCount: attempt.violationCount,
        maxViolationCount,
        autoSubmitted: shouldAutoSubmit,
      }
    }).then(async (result) => {
      // Runs after the violation-count transaction commits, in its own
      // transaction (submit() takes its own row lock) — keeps the two
      // concerns (recording vs. grading) independently retryable.
      if (result.autoSubmitted) {
        await ExamAttemptService.submit(attemptId, 'auto_submitted')
      }
      return result
    })
  }
}
