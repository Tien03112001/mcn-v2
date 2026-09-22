import vine from '@vinejs/vine'

export const createExamValidator = vine.create({
  subjectId: vine.number(),
  title: vine.string().maxLength(255),
  description: vine.string().optional(),
  durationMinutes: vine.number().min(1),
  totalScore: vine.number().min(0).optional(),
  maxViolationCount: vine.number().min(0).optional(),
  tagIds: vine.array(vine.number()).optional(),
})

export const updateExamValidator = vine.create({
  subjectId: vine.number().optional(),
  title: vine.string().maxLength(255).optional(),
  description: vine.string().optional(),
  durationMinutes: vine.number().min(1).optional(),
  totalScore: vine.number().min(0).optional(),
  maxViolationCount: vine.number().min(0).optional(),
  tagIds: vine.array(vine.number()).optional(),
})

export const addExamQuestionValidator = vine.create({
  questionId: vine.number(),
  score: vine.number().min(0),
})

export const updateExamQuestionValidator = vine.create({
  score: vine.number().min(0).optional(),
  orderIndex: vine.number().optional(),
})
