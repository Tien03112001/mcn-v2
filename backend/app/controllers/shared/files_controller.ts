import type { HttpContext } from '@adonisjs/core/http'
import FileAttachment from '#models/file_attachment'
import Question from '#models/question'
import FileStorageService from '#services/file_storage_service'

export default class FilesController {
  /**
   * Streams a stored file after checking the requester actually has a
   * reason to see it. Never served through the public static folder.
   */
  async show({ params, authUser, response }: HttpContext) {
    const attachment = await FileAttachment.find(params.id)
    if (!attachment) {
      return response.notFound({ error: { code: 'FILE_NOT_FOUND' } })
    }

    const canAccess = await this.#canAccess(attachment, authUser)
    if (!canAccess) {
      return response.forbidden({ error: { code: 'FORBIDDEN' } })
    }

    return response.download(FileStorageService.absolutePath(attachment))
  }

  async #canAccess(attachment: FileAttachment, authUser: HttpContext['authUser']): Promise<boolean> {
    if (authUser.role === 'admin') {
      return true
    }

    if (attachment.questionId) {
      const question = await Question.find(attachment.questionId)
      if (!question) return false

      if (authUser.role === 'teacher') {
        return question.createdBy === authUser.id
      }

      // Student access: allowed only through an active/graded exam
      // attempt that includes this question. Wired up once exam
      // attempts exist (milestone 5) — until then, students have no
      // legitimate reason to hit this endpoint.
      return false
    }

    return false
  }
}
