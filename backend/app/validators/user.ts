import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(64)

export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

export const refreshValidator = vine.create({
  refreshToken: vine.string().optional(),
})

export const createUserValidator = vine.create({
  fullName: vine.string().maxLength(255),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  role: vine.enum(['admin', 'teacher', 'student'] as const),
  studentCode: vine
    .string()
    .maxLength(50)
    .unique({ table: 'users', column: 'student_code' })
    .optional(),
})

export const updateUserValidator = vine.create({
  fullName: vine.string().maxLength(255).optional(),
  email: email().optional(),
  role: vine.enum(['admin', 'teacher', 'student'] as const).optional(),
  studentCode: vine.string().maxLength(50).optional(),
  isActive: vine.boolean().optional(),
})

export const resetPasswordValidator = vine.create({
  password: password(),
})
