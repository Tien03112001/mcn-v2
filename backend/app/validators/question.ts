import vine from '@vinejs/vine'

const optionInput = vine.object({
  label: vine.string().maxLength(10),
  content: vine.string(),
  isCorrect: vine.boolean(),
})

const partInput = vine.object({
  label: vine.string().maxLength(10),
  content: vine.string(),
  isCorrect: vine.boolean(),
})

const answerConfigInput = vine.object({
  scoringMode: vine.enum(['all_or_nothing'] as const).optional(),
  partialScoring: vine.array(vine.number()).fixedLength(5).optional(),
  answerType: vine.enum(['number', 'string'] as const).optional(),
  correctValue: vine.any().optional(),
  tolerance: vine.number().optional(),
  caseSensitive: vine.boolean().optional(),
  trim: vine.boolean().optional(),
  acceptedAlternatives: vine.array(vine.string()).optional(),
})

export const createQuestionValidator = vine.create({
  subjectId: vine.number(),
  topicId: vine.number().optional(),
  questionType: vine.enum(['single_choice', 'multiple_choice', 'true_false_group', 'short_answer'] as const),
  difficulty: vine.enum(['easy', 'medium', 'hard'] as const),
  content: vine.string(),
  explanation: vine.string().optional(),
  answerConfig: answerConfigInput.optional(),
  options: vine.array(optionInput).optional(),
  parts: vine.array(partInput).optional(),
})

export const updateQuestionValidator = vine.create({
  subjectId: vine.number().optional(),
  topicId: vine.number().optional(),
  difficulty: vine.enum(['easy', 'medium', 'hard'] as const).optional(),
  content: vine.string().optional(),
  explanation: vine.string().optional(),
  isActive: vine.boolean().optional(),
  answerConfig: answerConfigInput.optional(),
  options: vine.array(optionInput).optional(),
  parts: vine.array(partInput).optional(),
})
