import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'
import Topic from '#models/topic'
import TopicTransformer from '#transformers/topic_transformer'
import { createTopicValidator, updateTopicValidator } from '#validators/subject'

export default class TopicsController {
  async index({ params, response, serialize }: HttpContext) {
    const subject = await Subject.find(params.subjectId)
    if (!subject) {
      return response.notFound({ error: { code: 'SUBJECT_NOT_FOUND' } })
    }

    const topics = await Topic.query().where('subject_id', subject.id).orderBy('order_index', 'asc')
    return serialize(TopicTransformer.transform(topics))
  }

  async store({ params, request, response, serialize }: HttpContext) {
    const subject = await Subject.find(params.subjectId)
    if (!subject) {
      return response.notFound({ error: { code: 'SUBJECT_NOT_FOUND' } })
    }

    const data = await request.validateUsing(createTopicValidator)
    const topic = await Topic.create({ ...data, subjectId: subject.id, orderIndex: data.orderIndex ?? 0 })

    return response.created(await serialize(TopicTransformer.transform(topic)))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const topic = await Topic.find(params.id)
    if (!topic) {
      return response.notFound({ error: { code: 'TOPIC_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateTopicValidator)
    topic.merge(data)
    await topic.save()

    return serialize(TopicTransformer.transform(topic))
  }

  async destroy({ params, response }: HttpContext) {
    const topic = await Topic.find(params.id)
    if (!topic) {
      return response.notFound({ error: { code: 'TOPIC_NOT_FOUND' } })
    }
    await topic.delete()
    return response.noContent()
  }
}
