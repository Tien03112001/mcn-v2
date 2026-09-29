import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

function toMap(rows: { total: string | number; [key: string]: unknown }[], key: string) {
  const result: Record<string, number> = {}
  for (const row of rows) {
    result[String(row[key])] = Number(row.total)
  }
  return result
}

export default class DashboardController {
  /**
   * Same shape as the admin dashboard, but scoped to the exams/questions a
   * teacher created — admins hitting this route (they can, via the shared
   * teacher nav) see the platform-wide numbers instead, same convention
   * used by exams_controller.index.
   */
  async index({ authUser }: HttpContext) {
    const scopeToOwn = authUser.role === 'teacher'
    const teacherId = authUser.id
    const sevenDaysAgo = DateTime.now().minus({ days: 7 }).startOf('day')
    const now = DateTime.now()

    const questionsQuery = db
      .from('questions')
      .select('difficulty')
      .count('* as total')
      .groupBy('difficulty')
    if (scopeToOwn) questionsQuery.where('created_by', teacherId)

    const examsQuery = db.from('exams').select('status').count('* as total').groupBy('status')
    if (scopeToOwn) examsQuery.where('created_by', teacherId)

    const examRoomsQuery = db
      .from('exam_rooms')
      .join('exams', 'exams.id', 'exam_rooms.exam_id')
      .count('* as total')
    if (scopeToOwn) examRoomsQuery.where('exams.created_by', teacherId)

    function attemptsBase() {
      const q = db
        .from('exam_attempts')
        .join('exam_rooms', 'exam_rooms.id', 'exam_attempts.exam_room_id')
        .join('exams', 'exams.id', 'exam_rooms.exam_id')
      if (scopeToOwn) q.where('exams.created_by', teacherId)
      return q
    }

    function upcomingRoomsQuery() {
      const q = db
        .from('exam_rooms')
        .join('exams', 'exams.id', 'exam_rooms.exam_id')
        .select(
          'exam_rooms.id',
          'exams.id as examId',
          'exams.title as examTitle',
          'exam_rooms.name as roomName',
          'exam_rooms.opens_at as opensAt',
          'exam_rooms.closes_at as closesAt'
        )
        .where('exam_rooms.opens_at', '>=', now.toSQL()!)
        .orderBy('exam_rooms.opens_at', 'asc')
        .limit(5)
      if (scopeToOwn) q.where('exams.created_by', teacherId)
      return q
    }

    function recentAttemptsQuery() {
      const q = db
        .from('exam_attempts')
        .join('users', 'users.id', 'exam_attempts.student_id')
        .join('exam_rooms', 'exam_rooms.id', 'exam_attempts.exam_room_id')
        .join('exams', 'exams.id', 'exam_rooms.exam_id')
        .select(
          'exam_attempts.id',
          'users.full_name as studentName',
          'exams.title as examTitle',
          'exam_rooms.name as roomName',
          'exam_attempts.status',
          'exam_attempts.score',
          'exam_attempts.submitted_at as submittedAt'
        )
        .orderBy('exam_attempts.created_at', 'desc')
        .limit(8)
      if (scopeToOwn) q.where('exams.created_by', teacherId)
      return q
    }

    const [
      questionsByDifficulty,
      examsByStatus,
      totalExamRooms,
      attemptsByStatus,
      averageScoreRow,
      flaggedAttempts,
      attemptsLast7Days,
      trendRows,
      upcomingExamRooms,
      recentAttempts,
    ] = await Promise.all([
      questionsQuery,
      examsQuery,
      examRoomsQuery.first(),
      attemptsBase()
        .select('exam_attempts.status')
        .count('* as total')
        .groupBy('exam_attempts.status'),
      attemptsBase().whereNotNull('exam_attempts.score').avg('exam_attempts.score as avg').first(),
      attemptsBase().where('exam_attempts.is_flagged', true).count('* as total').first(),
      attemptsBase()
        .where('exam_attempts.created_at', '>=', sevenDaysAgo.toSQL()!)
        .count('* as total')
        .first(),
      attemptsBase()
        .select(db.raw("date_trunc('day', exam_attempts.created_at) as day"))
        .count('* as total')
        .where('exam_attempts.created_at', '>=', sevenDaysAgo.toSQL()!)
        .groupByRaw("date_trunc('day', exam_attempts.created_at)")
        .orderBy('day', 'asc'),
      upcomingRoomsQuery(),
      recentAttemptsQuery(),
    ])

    const questionsMap = toMap(questionsByDifficulty, 'difficulty')
    const examsMap = toMap(examsByStatus, 'status')
    const attemptsMap = toMap(attemptsByStatus, 'status')

    return {
      data: {
        questions: {
          total: Object.values(questionsMap).reduce((sum, n) => sum + n, 0),
          easy: questionsMap.easy ?? 0,
          medium: questionsMap.medium ?? 0,
          hard: questionsMap.hard ?? 0,
        },
        exams: {
          total: Object.values(examsMap).reduce((sum, n) => sum + n, 0),
          draft: examsMap.draft ?? 0,
          published: examsMap.published ?? 0,
          archived: examsMap.archived ?? 0,
        },
        examRooms: { total: Number(totalExamRooms?.total ?? 0) },
        attempts: {
          total: Object.values(attemptsMap).reduce((sum, n) => sum + n, 0),
          inProgress: attemptsMap.in_progress ?? 0,
          submitted: attemptsMap.submitted ?? 0,
          autoSubmitted: attemptsMap.auto_submitted ?? 0,
          expired: attemptsMap.expired ?? 0,
          last7Days: Number(attemptsLast7Days?.total ?? 0),
          averageScore: averageScoreRow?.avg ? Number(averageScoreRow.avg) : null,
          flagged: Number(flaggedAttempts?.total ?? 0),
        },
        trend: trendRows.map((row: { day: Date | string; total: string | number }) => ({
          date: DateTime.fromJSDate(new Date(row.day)).toISODate(),
          total: Number(row.total),
        })),
        upcomingExamRooms,
        recentAttempts: recentAttempts.map((row: Record<string, unknown>) => ({
          ...row,
          score: row.score === null ? null : Number(row.score),
        })),
      },
    }
  }
}
