import type ClassModel from '#models/class'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ClassTransformer extends BaseTransformer<ClassModel> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'code',
      'name',
      'academicYear',
      'createdBy',
      'createdAt',
      'updatedAt',
    ])
  }
}
