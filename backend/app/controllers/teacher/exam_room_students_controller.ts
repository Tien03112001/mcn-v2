import crypto from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Exam from '#models/exam'
import ExamRoom from '#models/exam_room'
import ExamRoomStudent from '#models/exam_room_student'
import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { addExamRoomStudentValidator } from '#validators/exam_room'

async function loadOwnedRoom(examId: number, roomId: number, authUser: HttpContext['authUser']) {
  const exam = await Exam.find(examId)
  if (!exam || (authUser.role === 'teacher' && exam.createdBy !== authUser.id)) {
    return null
  }
  return ExamRoom.query().where('id', roomId).where('exam_id', exam.id).first()
}

export default class ExamRoomStudentsController {
  async index({ params, authUser, response, serialize }: HttpContext) {
    const room = await loadOwnedRoom(Number(params.id), Number(params.roomId), authUser)
    if (!room) {
      return response.notFound({ error: { code: 'EXAM_ROOM_NOT_FOUND' } })
    }

    const students = await room.related('students').query().orderBy('full_name', 'asc')
    return serialize(UserTransformer.transform(students))
  }

  async store({ params, request, authUser, response, serialize }: HttpContext) {
    const room = await loadOwnedRoom(Number(params.id), Number(params.roomId), authUser)
    if (!room) {
      return response.notFound({ error: { code: 'EXAM_ROOM_NOT_FOUND' } })
    }

    const { studentId } = await request.validateUsing(addExamRoomStudentValidator)
    const student = await User.query().where('id', studentId).where('role', 'student').first()
    if (!student) {
      return response.notFound({ error: { code: 'STUDENT_NOT_FOUND' } })
    }

    const existing = await ExamRoomStudent.query()
      .where('exam_room_id', room.id)
      .where('student_id', studentId)
      .first()
    if (existing) {
      return response.conflict({ error: { code: 'STUDENT_ALREADY_ADDED' } })
    }

    await ExamRoomStudent.create({
      examRoomId: room.id,
      studentId,
      addedAt: DateTime.now(),
    })

    return response.created(await serialize(UserTransformer.transform(student)))
  }

  /**
   * Bulk import students from an Excel file. Expected columns (header row):
   * full_name | email | student_code | password
   * Existing users (matched by email) are added as-is; new rows create a
   * student account first. Processed inside a transaction so a bad row
   * doesn't leave a half-imported roster.
   */
  async importStudents({ params, request, authUser, response }: HttpContext) {
    const room = await loadOwnedRoom(Number(params.id), Number(params.roomId), authUser)
    if (!room) {
      return response.notFound({ error: { code: 'EXAM_ROOM_NOT_FOUND' } })
    }

    const file = request.file('file', {
      extnames: ['xlsx', 'xls'],
      size: '5mb',
    })

    if (!file || !file.isValid || !file.tmpPath) {
      return response.badRequest({ error: { code: 'INVALID_FILE', messages: file?.errors } })
    }

    const excelJsModule = await import('exceljs')
    const ExcelJS = excelJsModule.default
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(file.tmpPath)
    const sheet = workbook.worksheets[0]

    const rows: { fullName: string; email: string; studentCode?: string }[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // header
      const [, fullName, email, studentCode] = row.values as unknown[]
      if (!fullName || !email) return
      rows.push({
        fullName: String(fullName).trim(),
        email: String(email).trim().toLowerCase(),
        studentCode: studentCode ? String(studentCode).trim() : undefined,
      })
    })

    const result = { enrolled: 0, created: 0, skipped: [] as string[] }

    await db.transaction(async (trx) => {
      for (const row of rows) {
        let user = await User.query({ client: trx }).where('email', row.email).first()

        if (!user) {
          user = new User()
          user.useTransaction(trx)
          user.fullName = row.fullName
          user.email = row.email
          user.role = 'student'
          user.studentCode = row.studentCode ?? null
          user.password = crypto.randomUUID()
          user.isActive = true
          await user.save()
          result.created++
        }

        const existing = await ExamRoomStudent.query({ client: trx })
          .where('exam_room_id', room.id)
          .where('student_id', user.id)
          .first()

        if (existing) {
          result.skipped.push(row.email)
          continue
        }

        const enrollment = new ExamRoomStudent()
        enrollment.useTransaction(trx)
        enrollment.examRoomId = room.id
        enrollment.studentId = user.id
        enrollment.addedAt = DateTime.now()
        await enrollment.save()
        result.enrolled++
      }
    })

    return response.created({ data: result })
  }

  async destroy({ params, authUser, response }: HttpContext) {
    const room = await loadOwnedRoom(Number(params.id), Number(params.roomId), authUser)
    if (!room) {
      return response.notFound({ error: { code: 'EXAM_ROOM_NOT_FOUND' } })
    }

    const enrollment = await ExamRoomStudent.query()
      .where('exam_room_id', room.id)
      .where('student_id', params.studentId)
      .first()

    if (!enrollment) {
      return response.notFound({ error: { code: 'ENROLLMENT_NOT_FOUND' } })
    }

    await enrollment.delete()
    return response.noContent()
  }
}
