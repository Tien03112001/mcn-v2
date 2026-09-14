import crypto from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class from '#models/class'
import ClassStudent from '#models/class_student'
import TeacherClass from '#models/teacher_class'
import User from '#models/user'
import ClassTransformer from '#transformers/class_transformer'
import UserTransformer from '#transformers/user_transformer'
import {
  createClassValidator,
  updateClassValidator,
  addStudentValidator,
  assignTeacherValidator,
} from '#validators/class'
import { DateTime } from 'luxon'

export default class ClassesController {
  async index({ request, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const classes = await Class.query().orderBy('id', 'desc').paginate(page, perPage)
    return serialize(ClassTransformer.paginate(classes.all(), classes.getMeta()))
  }

  async store({ request, response, authUser, serialize }: HttpContext) {
    const data = await request.validateUsing(createClassValidator)
    const klass = await Class.create({ ...data, createdBy: authUser.id })
    return response.created(await serialize(ClassTransformer.transform(klass)))
  }

  async show({ params, response, serialize }: HttpContext) {
    const klass = await Class.find(params.id)
    if (!klass) {
      return response.notFound({ error: { code: 'CLASS_NOT_FOUND' } })
    }
    return serialize(ClassTransformer.transform(klass))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const klass = await Class.find(params.id)
    if (!klass) {
      return response.notFound({ error: { code: 'CLASS_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateClassValidator)
    klass.merge(data)
    await klass.save()

    return serialize(ClassTransformer.transform(klass))
  }

  async destroy({ params, response }: HttpContext) {
    const klass = await Class.find(params.id)
    if (!klass) {
      return response.notFound({ error: { code: 'CLASS_NOT_FOUND' } })
    }
    await klass.delete()
    return response.noContent()
  }

  async students({ params, response, serialize }: HttpContext) {
    const klass = await Class.find(params.id)
    if (!klass) {
      return response.notFound({ error: { code: 'CLASS_NOT_FOUND' } })
    }

    const students = await klass.related('students').query().orderBy('full_name', 'asc')
    return serialize(UserTransformer.transform(students))
  }

  async addStudent({ params, request, response, serialize }: HttpContext) {
    const klass = await Class.find(params.id)
    if (!klass) {
      return response.notFound({ error: { code: 'CLASS_NOT_FOUND' } })
    }

    const { studentId } = await request.validateUsing(addStudentValidator)
    const student = await User.query().where('id', studentId).where('role', 'student').first()
    if (!student) {
      return response.notFound({ error: { code: 'STUDENT_NOT_FOUND' } })
    }

    const existing = await ClassStudent.query()
      .where('class_id', klass.id)
      .where('student_id', studentId)
      .first()
    if (existing) {
      return response.conflict({ error: { code: 'STUDENT_ALREADY_ENROLLED' } })
    }

    await ClassStudent.create({
      classId: klass.id,
      studentId,
      enrolledAt: DateTime.now(),
    })

    return response.created(await serialize(UserTransformer.transform(student)))
  }

  /**
   * Bulk import students from an Excel file. Expected columns (header row):
   * full_name | email | student_code | password
   * Existing users (matched by email) are enrolled as-is; new rows create
   * a student account first. Processed inside a transaction so a bad row
   * doesn't leave a half-imported class.
   */
  async importStudents({ params, request, response }: HttpContext) {
    const klass = await Class.find(params.id)
    if (!klass) {
      return response.notFound({ error: { code: 'CLASS_NOT_FOUND' } })
    }

    const file = request.file('file', {
      extnames: ['xlsx', 'xls'],
      size: '5mb',
    })

    if (!file || !file.isValid || !file.tmpPath) {
      return response.badRequest({ error: { code: 'INVALID_FILE', messages: file?.errors } })
    }

    const ExcelJS = (await import('exceljs')).default
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

        const existing = await ClassStudent.query({ client: trx })
          .where('class_id', klass.id)
          .where('student_id', user.id)
          .first()

        if (existing) {
          result.skipped.push(row.email)
          continue
        }

        const enrollment = new ClassStudent()
        enrollment.useTransaction(trx)
        enrollment.classId = klass.id
        enrollment.studentId = user.id
        enrollment.enrolledAt = DateTime.now()
        await enrollment.save()
        result.enrolled++
      }
    })

    return response.created({ data: result })
  }

  async removeStudent({ params, response }: HttpContext) {
    const enrollment = await ClassStudent.query()
      .where('class_id', params.id)
      .where('student_id', params.studentId)
      .first()

    if (!enrollment) {
      return response.notFound({ error: { code: 'ENROLLMENT_NOT_FOUND' } })
    }

    await enrollment.delete()
    return response.noContent()
  }

  async assignTeacher({ params, request, response, serialize }: HttpContext) {
    const klass = await Class.find(params.id)
    if (!klass) {
      return response.notFound({ error: { code: 'CLASS_NOT_FOUND' } })
    }

    const { teacherId } = await request.validateUsing(assignTeacherValidator)
    const teacher = await User.query().where('id', teacherId).where('role', 'teacher').first()
    if (!teacher) {
      return response.notFound({ error: { code: 'TEACHER_NOT_FOUND' } })
    }

    const existing = await TeacherClass.query()
      .where('class_id', klass.id)
      .where('teacher_id', teacherId)
      .first()
    if (existing) {
      return response.conflict({ error: { code: 'TEACHER_ALREADY_ASSIGNED' } })
    }

    await TeacherClass.create({
      classId: klass.id,
      teacherId,
      assignedAt: DateTime.now(),
    })

    return response.created(await serialize(UserTransformer.transform(teacher)))
  }

  async removeTeacher({ params, response }: HttpContext) {
    const assignment = await TeacherClass.query()
      .where('class_id', params.id)
      .where('teacher_id', params.teacherId)
      .first()

    if (!assignment) {
      return response.notFound({ error: { code: 'ASSIGNMENT_NOT_FOUND' } })
    }

    await assignment.delete()
    return response.noContent()
  }
}
