import type Document from '#models/document'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class DocumentTransformer extends BaseTransformer<Document> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'description',
        'subjectId',
        'fileName',
        'mimeType',
        'uploadedBy',
        'createdAt',
      ]),
      sizeBytes: this.resource.sizeBytesNumber,
      uploadedByName: this.resource.uploader?.fullName ?? null,
      subjectName: this.resource.subject?.name ?? null,
    }
  }
}
