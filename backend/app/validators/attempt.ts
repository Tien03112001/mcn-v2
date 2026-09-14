import vine from '@vinejs/vine'

const isoDate = () => vine.date({ formats: ['iso8601'] })

export const saveAnswerValidator = vine.create({
  selectedOptionId: vine.number().nullable().optional(),
  selectedOptionIds: vine.array(vine.number()).optional(),
  answers: vine.record(vine.boolean()).optional(),
  rawValue: vine.string().nullable().optional(),
})

export const reportViolationValidator = vine.create({
  violationType: vine.enum(['tab_hidden', 'window_blur', 'fullscreen_exit'] as const).optional(),
  clientReportedAt: isoDate().optional(),
})
