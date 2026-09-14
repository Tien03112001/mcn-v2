import vine from '@vinejs/vine'

export const createTagValidator = vine.create({
  name: vine.string().maxLength(100).unique({ table: 'tags', column: 'name' }),
})

export const updateTagValidator = vine.create({
  name: vine.string().maxLength(100).optional(),
})
