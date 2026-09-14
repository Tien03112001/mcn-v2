import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import Question from '#models/question'
import FileAttachment from '#models/file_attachment'
import FileStorageService from '#services/file_storage_service'

export default class AttachmentsController {
  async store({ params, request, authUser, response }: HttpContext) {
    const question = await Question.find(params.questionId)
    if (!question || (authUser.role === 'teacher' && question.createdBy !== authUser.id)) {
      return response.notFound({ error: { code: 'QUESTION_NOT_FOUND' } })
    }

    const file = request.file('file', {
      extnames: FileStorageService.allowedExtensions,
      size: `${env.get('MAX_UPLOAD_SIZE_MB')}mb`,
    })

    if (!file || !file.isValid) {
      return response.badRequest({ error: { code: 'INVALID_FILE', messages: file?.errors } })
    }

    const attachment = await FileStorageService.storeQuestionAttachment(file, question.id, authUser.id)

    return response.created({
      data: {
        id: attachment.id,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
      },
    })
  }

  async destroy({ params, authUser, response }: HttpContext) {
    const attachment = await FileAttachment.query()
      .where('id', params.fileId)
      .where('question_id', params.questionId)
      .first()

    if (!attachment) {
      return response.notFound({ error: { code: 'ATTACHMENT_NOT_FOUND' } })
    }

    const question = await Question.find(params.questionId)
    if (question && authUser.role === 'teacher' && question.createdBy !== authUser.id) {
      return response.forbidden({ error: { code: 'FORBIDDEN' } })
    }

    await attachment.delete()
    return response.noContent()
  }
}
