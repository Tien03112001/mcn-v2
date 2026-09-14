import type Topic from '#models/topic'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TopicTransformer extends BaseTransformer<Topic> {
  toObject() {
    return this.pick(this.resource, ['id', 'subjectId', 'name', 'orderIndex', 'createdAt', 'updatedAt'])
  }
}
