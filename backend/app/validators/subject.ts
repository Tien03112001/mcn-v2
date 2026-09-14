import vine from '@vinejs/vine'

export const createSubjectValidator = vine.create({
  code: vine.string().maxLength(50).unique({ table: 'subjects', column: 'code' }),
  name: vine.string().maxLength(255),
  description: vine.string().optional(),
})

export const updateSubjectValidator = vine.create({
  code: vine.string().maxLength(50).optional(),
  name: vine.string().maxLength(255).optional(),
  description: vine.string().optional(),
})

export const createTopicValidator = vine.create({
  name: vine.string().maxLength(255),
  orderIndex: vine.number().optional(),
})

export const updateTopicValidator = vine.create({
  name: vine.string().maxLength(255).optional(),
  orderIndex: vine.number().optional(),
})
