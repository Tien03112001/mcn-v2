import vine from '@vinejs/vine'

export const createClassValidator = vine.create({
  code: vine.string().maxLength(50).unique({ table: 'classes', column: 'code' }),
  name: vine.string().maxLength(255),
  academicYear: vine.string().maxLength(20).optional(),
})

export const updateClassValidator = vine.create({
  code: vine.string().maxLength(50).optional(),
  name: vine.string().maxLength(255).optional(),
  academicYear: vine.string().maxLength(20).optional(),
})

export const addStudentValidator = vine.create({
  studentId: vine.number(),
})

export const assignTeacherValidator = vine.create({
  teacherId: vine.number(),
})
