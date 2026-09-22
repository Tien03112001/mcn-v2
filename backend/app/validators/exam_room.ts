import vine from '@vinejs/vine'

const isoDate = () => vine.date({ formats: ['iso8601'] })

export const createExamRoomValidator = vine.create({
  name: vine.string().maxLength(255),
  opensAt: isoDate(),
  closesAt: isoDate(),
})

export const updateExamRoomValidator = vine.create({
  name: vine.string().maxLength(255).optional(),
  opensAt: isoDate().optional(),
  closesAt: isoDate().optional(),
})

export const addExamRoomStudentValidator = vine.create({
  studentId: vine.number(),
})
