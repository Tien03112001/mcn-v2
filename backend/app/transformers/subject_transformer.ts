import type Subject from '#models/subject'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class SubjectTransformer extends BaseTransformer<Subject> {
  toObject() {
    return this.pick(this.resource, ['id', 'code', 'name', 'description', 'createdAt', 'updatedAt'])
  }
}
