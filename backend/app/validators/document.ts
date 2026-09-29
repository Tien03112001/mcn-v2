import vine from '@vinejs/vine'

export const createDocumentValidator = vine.create({
  title: vine.string().maxLength(255),
  description: vine.string().optional(),
  category: vine.string().maxLength(100).optional(),
})
