import { test } from '@japa/runner'
import GradingService from '#services/grading_service'
import Question from '#models/question'
import QuestionOption from '#models/question_option'
import QuestionPart from '#models/question_part'

function makeQuestion(
  questionType: Question['questionType'],
  answerConfig: Question['answerConfig'] = {}
): Question {
  const question = new Question()
  question.questionType = questionType
  question.answerConfig = answerConfig
  question.$setRelated('options', [])
  question.$setRelated('parts', [])
  return question
}

function makeOption(id: number, isCorrect: boolean): QuestionOption {
  const option = new QuestionOption()
  option.id = id
  option.isCorrect = isCorrect
  return option
}

function makePart(label: string, isCorrect: boolean): QuestionPart {
  const part = new QuestionPart()
  part.label = label
  part.isCorrect = isCorrect
  return part
}

test.group('GradingService - single_choice', () => {
  test('awards full score when the selected option is correct', async ({ assert }) => {
    const question = makeQuestion('single_choice')
    question.$setRelated('options', [makeOption(1, false), makeOption(2, true)])

    const result = await GradingService.grade(question, { selectedOptionId: 2 }, 10)

    assert.isTrue(result.isCorrect)
    assert.equal(result.scoreAwarded, 10)
  })

  test('awards zero when the selected option is wrong', async ({ assert }) => {
    const question = makeQuestion('single_choice')
    question.$setRelated('options', [makeOption(1, false), makeOption(2, true)])

    const result = await GradingService.grade(question, { selectedOptionId: 1 }, 10)

    assert.isFalse(result.isCorrect)
    assert.equal(result.scoreAwarded, 0)
  })

  test('awards zero when nothing was selected', async ({ assert }) => {
    const question = makeQuestion('single_choice')
    question.$setRelated('options', [makeOption(1, false), makeOption(2, true)])

    const result = await GradingService.grade(question, { selectedOptionId: null }, 10)

    assert.isFalse(result.isCorrect)
    assert.equal(result.scoreAwarded, 0)
  })
})

test.group('GradingService - multiple_choice', () => {
  test('awards full score only on an exact match of all correct options', async ({ assert }) => {
    const question = makeQuestion('multiple_choice', { scoringMode: 'all_or_nothing' })
    question.$setRelated('options', [
      makeOption(1, true),
      makeOption(2, false),
      makeOption(3, true),
      makeOption(4, false),
    ])

    const result = await GradingService.grade(question, { selectedOptionIds: [1, 3] }, 10)

    assert.isTrue(result.isCorrect)
    assert.equal(result.scoreAwarded, 10)
  })

  test('awards zero on a partial match (missing one correct option)', async ({ assert }) => {
    const question = makeQuestion('multiple_choice', { scoringMode: 'all_or_nothing' })
    question.$setRelated('options', [makeOption(1, true), makeOption(2, false), makeOption(3, true)])

    const result = await GradingService.grade(question, { selectedOptionIds: [1] }, 10)

    assert.isFalse(result.isCorrect)
    assert.equal(result.scoreAwarded, 0)
  })

  test('awards zero when an extra wrong option is included', async ({ assert }) => {
    const question = makeQuestion('multiple_choice', { scoringMode: 'all_or_nothing' })
    question.$setRelated('options', [makeOption(1, true), makeOption(2, false)])

    const result = await GradingService.grade(question, { selectedOptionIds: [1, 2] }, 10)

    assert.isFalse(result.isCorrect)
    assert.equal(result.scoreAwarded, 0)
  })
})

test.group('GradingService - true_false_group', () => {
  const partialScoring: [number, number, number, number, number] = [0, 0.1, 0.25, 0.5, 1]

  test('awards full score when all four parts are answered correctly', async ({ assert }) => {
    const question = makeQuestion('true_false_group', { partialScoring })
    question.$setRelated('parts', [
      makePart('a', true),
      makePart('b', false),
      makePart('c', true),
      makePart('d', false),
    ])

    const result = await GradingService.grade(
      question,
      { answers: { a: true, b: false, c: true, d: false } },
      10
    )

    assert.isTrue(result.isCorrect)
    assert.equal(result.scoreAwarded, 10)
  })

  test('awards partial credit per the configured ratio (2/4 correct -> 25%)', async ({ assert }) => {
    const question = makeQuestion('true_false_group', { partialScoring })
    question.$setRelated('parts', [
      makePart('a', true),
      makePart('b', false),
      makePart('c', true),
      makePart('d', false),
    ])

    const result = await GradingService.grade(
      question,
      { answers: { a: true, b: false, c: false, d: true } },
      10
    )

    assert.isFalse(result.isCorrect)
    assert.equal(result.scoreAwarded, 2.5)
  })

  test('awards zero when no parts are answered', async ({ assert }) => {
    const question = makeQuestion('true_false_group', { partialScoring })
    question.$setRelated('parts', [makePart('a', true), makePart('b', false)])

    const result = await GradingService.grade(question, { answers: {} }, 10)

    assert.equal(result.scoreAwarded, 0)
  })
})

test.group('GradingService - short_answer', () => {
  test('accepts a numeric answer within tolerance', async ({ assert }) => {
    const question = makeQuestion('short_answer', {
      answerType: 'number',
      correctValue: 12,
      tolerance: 0.05,
    })

    const result = await GradingService.grade(question, { rawValue: '12.03' }, 10)

    assert.isTrue(result.isCorrect)
    assert.equal(result.scoreAwarded, 10)
  })

  test('rejects a numeric answer outside tolerance', async ({ assert }) => {
    const question = makeQuestion('short_answer', {
      answerType: 'number',
      correctValue: 12,
      tolerance: 0.01,
    })

    const result = await GradingService.grade(question, { rawValue: '12.5' }, 10)

    assert.isFalse(result.isCorrect)
    assert.equal(result.scoreAwarded, 0)
  })

  test('accepts a case-insensitive trimmed string match', async ({ assert }) => {
    const question = makeQuestion('short_answer', {
      answerType: 'string',
      correctValue: 'Hà Nội',
      caseSensitive: false,
      trim: true,
    })

    const result = await GradingService.grade(question, { rawValue: '  hà nội  ' }, 10)

    assert.isTrue(result.isCorrect)
    assert.equal(result.scoreAwarded, 10)
  })

  test('accepts an alternative equivalent answer', async ({ assert }) => {
    const question = makeQuestion('short_answer', {
      answerType: 'number',
      correctValue: 0.75,
      tolerance: 0.001,
      acceptedAlternatives: ['3/4'],
    })

    const result = await GradingService.grade(question, { rawValue: '3/4' }, 10)

    assert.isTrue(result.isCorrect)
  })

  test('rejects an empty answer', async ({ assert }) => {
    const question = makeQuestion('short_answer', {
      answerType: 'string',
      correctValue: 'test',
    })

    const result = await GradingService.grade(question, { rawValue: '' }, 10)

    assert.isFalse(result.isCorrect)
    assert.equal(result.scoreAwarded, 0)
  })
})
