import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User, { type UserRole } from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { createUserValidator, updateUserValidator, resetPasswordValidator } from '#validators/user'

const VALID_ROLES: UserRole[] = ['admin', 'teacher', 'student']
const TEMPLATE_COLUMNS = [
  { header: 'full_name', key: 'full_name', width: 25 },
  { header: 'email', key: 'email', width: 30 },
  { header: 'role', key: 'role', width: 12 },
  { header: 'student_code', key: 'student_code', width: 15 },
  { header: 'password', key: 'password', width: 18 },
]

export default class UsersController {
  async index({ request, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const role = request.input('role')

    const query = User.query().orderBy('id', 'desc')
    if (role) {
      query.where('role', role)
    }

    const users = await query.paginate(page, perPage)
    return serialize(UserTransformer.paginate(users.all(), users.getMeta()))
  }

  async store({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    const user = await User.create(data)
    return response.created(await serialize(UserTransformer.transform(user)))
  }

  async show({ params, response, serialize }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: { code: 'USER_NOT_FOUND' } })
    }
    return serialize(UserTransformer.transform(user))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: { code: 'USER_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateUserValidator, {
      meta: { userId: user.id },
    })
    user.merge(data)
    await user.save()

    return serialize(UserTransformer.transform(user))
  }

  async resetPassword({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: { code: 'USER_NOT_FOUND' } })
    }

    const { password } = await request.validateUsing(resetPasswordValidator)

    user.password = password
    await user.save()

    return { message: 'Password reset successfully' }
  }

  /** Downloadable .xlsx template matching the columns `import()` expects. */
  async template({ response }: HttpContext) {
    const excelJsModule = await import('exceljs')
    const ExcelJS = excelJsModule.default
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Người dùng')
    sheet.columns = TEMPLATE_COLUMNS

    sheet.addRow({
      full_name: 'Nguyễn Văn A',
      email: 'sv.a@example.com',
      role: 'student',
      student_code: 'SV001',
      password: 'Student@123',
    })
    sheet.addRow({
      full_name: 'Trần Thị B',
      email: 'gv.b@example.com',
      role: 'teacher',
      student_code: '',
      password: 'Teacher@123',
    })

    const buffer = await workbook.xlsx.writeBuffer()
    response.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response.header('Content-Disposition', 'attachment; filename="mau_nhap_nguoi_dung.xlsx"')
    return response.send(Buffer.from(buffer))
  }

  /**
   * Bulk-creates users from an Excel file. Expected columns (header row):
   * full_name | email | role | student_code | password
   * Rows with a missing required field, an invalid role, or an email that
   * already exists are skipped and reported back — nothing is created for
   * a row unless it's fully valid. Runs in a transaction so a bad batch
   * doesn't leave a half-imported set of accounts.
   */
  async import({ request, response }: HttpContext) {
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

    const rows: {
      fullName: string
      email: string
      role: string
      studentCode?: string
      password: string
    }[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // header
      const [, fullName, email, role, studentCode, password] = row.values as unknown[]
      if (!fullName || !email || !role || !password) return
      rows.push({
        fullName: String(fullName).trim(),
        email: String(email).trim().toLowerCase(),
        role: String(role).trim().toLowerCase(),
        studentCode: studentCode ? String(studentCode).trim() : undefined,
        password: String(password),
      })
    })

    const result = { created: 0, skipped: [] as string[] }

    await db.transaction(async (trx) => {
      for (const row of rows) {
        if (!VALID_ROLES.includes(row.role as UserRole)) {
          result.skipped.push(`${row.email} (vai trò không hợp lệ)`)
          continue
        }

        const existing = await User.query({ client: trx }).where('email', row.email).first()
        if (existing) {
          result.skipped.push(row.email)
          continue
        }

        const user = new User()
        user.useTransaction(trx)
        user.fullName = row.fullName
        user.email = row.email
        user.role = row.role as UserRole
        user.studentCode = row.studentCode ?? null
        user.password = row.password
        user.isActive = true
        await user.save()
        result.created++
      }
    })

    return response.created({ data: result })
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: { code: 'USER_NOT_FOUND' } })
    }

    user.isActive = false
    await user.save()

    return response.noContent()
  }
}
