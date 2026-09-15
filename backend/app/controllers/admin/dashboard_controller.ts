import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

async function countBy(table: string, column: string) {
  const rows = await db.from(table).select(column).count('* as total').groupBy(column)
  const result: Record<string, number> = {}
  for (const row of rows) {
    result[String(row[column])] = Number(row.total)
  }
  return result
}

export default class DashboardController {
  async index({}: HttpContext) {
    const sevenDaysAgo = DateTime.now().minus({ days: 7 }).startOf('day')
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).startOf('day')
    const now = DateTime.now()

    const [
      usersByRole,
      activeUsers,
      totalClasses,
      totalSubjects,
      questionsByDifficulty,
      examsByStatus,
      attemptsByStatus,
      averageScoreRow,
      flaggedAttempts,
      attemptsLast7Days,
      newUsersLast30Days,
      trendRows,
      upcomingExamClasses,
      recentAttempts,
    ] = await Promise.all([
      countBy('users', 'role'),
      db.from('users').where('is_active', true).count('* as total').first(),
      db.from('classes').count('* as total').first(),
      db.from('subjects').count('* as total').first(),
      countBy('questions', 'difficulty'),
      countBy('exams', 'status'),
      countBy('exam_attempts', 'status'),
      db.from('exam_attempts').whereNotNull('score').avg('score as avg').first(),
      db.from('exam_attempts').where('is_flagged', true).count('* as total').first(),
      db
        .from('exam_attempts')
        .where('created_at', '>=', sevenDaysAgo.toSQL()!)
        .count('* as total')
        .first(),
      db
        .from('users')
        .where('created_at', '>=', thirtyDaysAgo.toSQL()!)
        .count('* as total')
        .first(),
      db
        .from('exam_attempts')
        .select(db.raw("date_trunc('day', created_at) as day"))
        .count('* as total')
        .where('created_at', '>=', sevenDaysAgo.toSQL()!)
        .groupByRaw("date_trunc('day', created_at)")
        .orderBy('day', 'asc'),
      db
        .from('exam_classes')
        .join('exams', 'exams.id', 'exam_classes.exam_id')
        .join('classes', 'classes.id', 'exam_classes.class_id')
        .select(
          'exam_classes.id',
          'exams.id as examId',
          'exams.title as examTitle',
          'classes.name as className',
          'exam_classes.opens_at as opensAt',
          'exam_classes.closes_at as closesAt'
        )
        .where('exam_classes.opens_at', '>=', now.toSQL()!)
        .orderBy('exam_classes.opens_at', 'asc')
        .limit(5),
      db
        .from('exam_attempts')
        .join('users', 'users.id', 'exam_attempts.student_id')
        .join('exam_classes', 'exam_classes.id', 'exam_attempts.exam_class_id')
        .join('exams', 'exams.id', 'exam_classes.exam_id')
        .select(
          'exam_attempts.id',
          'users.full_name as studentName',
          'exams.title as examTitle',
          'exam_attempts.status',
          'exam_attempts.score',
          'exam_attempts.submitted_at as submittedAt'
        )
        .orderBy('exam_attempts.created_at', 'desc')
        .limit(8),
    ])

    return {
      data: {
        users: {
          total: Object.values(usersByRole).reduce((sum, n) => sum + n, 0),
          admin: usersByRole.admin ?? 0,
          teacher: usersByRole.teacher ?? 0,
          student: usersByRole.student ?? 0,
          active: Number(activeUsers?.total ?? 0),
          newLast30Days: Number(newUsersLast30Days?.total ?? 0),
        },
        classes: { total: Number(totalClasses?.total ?? 0) },
        subjects: { total: Number(totalSubjects?.total ?? 0) },
        questions: {
          total: Object.values(questionsByDifficulty).reduce((sum, n) => sum + n, 0),
          easy: questionsByDifficulty.easy ?? 0,
          medium: questionsByDifficulty.medium ?? 0,
          hard: questionsByDifficulty.hard ?? 0,
        },
        exams: {
          total: Object.values(examsByStatus).reduce((sum, n) => sum + n, 0),
          draft: examsByStatus.draft ?? 0,
          published: examsByStatus.published ?? 0,
          archived: examsByStatus.archived ?? 0,
        },
        attempts: {
          total: Object.values(attemptsByStatus).reduce((sum, n) => sum + n, 0),
          inProgress: attemptsByStatus.in_progress ?? 0,
          submitted: attemptsByStatus.submitted ?? 0,
          autoSubmitted: attemptsByStatus.auto_submitted ?? 0,
          expired: attemptsByStatus.expired ?? 0,
          last7Days: Number(attemptsLast7Days?.total ?? 0),
          averageScore: averageScoreRow?.avg ? Number(averageScoreRow.avg) : null,
          flagged: Number(flaggedAttempts?.total ?? 0),
        },
        trend: trendRows.map((row: { day: Date | string; total: string | number }) => ({
          date: DateTime.fromJSDate(new Date(row.day)).toISODate(),
          total: Number(row.total),
        })),
        upcomingExamClasses,
        recentAttempts: recentAttempts.map((row: Record<string, unknown>) => ({
          ...row,
          score: row.score === null ? null : Number(row.score),
        })),
      },
    }
  }
}
