import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'
import SubjectTransformer from '#transformers/subject_transformer'
import { createSubjectValidator, updateSubjectValidator } from '#validators/subject'

export default class SubjectsController {
  async index({ serialize }: HttpContext) {
    const subjects = await Subject.query().orderBy('name', 'asc')
    return serialize(SubjectTransformer.transform(subjects))
  }

  async store({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createSubjectValidator)
    const subject = await Subject.create(data)
    return response.created(await serialize(SubjectTransformer.transform(subject)))
  }

  async show({ params, response, serialize }: HttpContext) {
    const subject = await Subject.find(params.id)
    if (!subject) {
      return response.notFound({ error: { code: 'SUBJECT_NOT_FOUND' } })
    }
    return serialize(SubjectTransformer.transform(subject))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const subject = await Subject.find(params.id)
    if (!subject) {
      return response.notFound({ error: { code: 'SUBJECT_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateSubjectValidator)
    subject.merge(data)
    await subject.save()

    return serialize(SubjectTransformer.transform(subject))
  }

  async destroy({ params, response }: HttpContext) {
    const subject = await Subject.find(params.id)
    if (!subject) {
      return response.notFound({ error: { code: 'SUBJECT_NOT_FOUND' } })
    }
    await subject.delete()
    return response.noContent()
  }
}
