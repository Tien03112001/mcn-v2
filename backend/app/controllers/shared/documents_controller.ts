import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import Document from '#models/document'
import DocumentTransformer from '#transformers/document_transformer'
import FileStorageService from '#services/file_storage_service'
import { createDocumentValidator } from '#validators/document'

export default class DocumentsController {
  async index({ request, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const keyword = request.input('keyword')
    const category = request.input('category')

    const query = Document.query().preload('uploader').orderBy('created_at', 'desc')
    if (keyword) {
      query.whereILike('title', `%${keyword}%`)
    }
    if (category) {
      query.where('category', category)
    }

    const documents = await query.paginate(page, perPage)
    return serialize(DocumentTransformer.paginate(documents.all(), documents.getMeta()))
  }

  async store({ request, authUser, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createDocumentValidator)

    const file = request.file('file', {
      extnames: FileStorageService.allowedDocumentExtensions,
      size: `${env.get('MAX_UPLOAD_SIZE_MB')}mb`,
    })

    if (!file || !file.isValid) {
      return response.badRequest({ error: { code: 'INVALID_FILE', messages: file?.errors } })
    }

    const stored = await FileStorageService.storeFile(file, 'documents')

    const document = await Document.create({
      title: data.title,
      description: data.description ?? null,
      category: data.category ?? null,
      fileName: stored.fileName,
      storedPath: stored.storedPath,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      uploadedBy: authUser.id,
    })
    await document.load('uploader')

    return response.created(await serialize(DocumentTransformer.transform(document)))
  }

  async download({ params, response }: HttpContext) {
    const document = await Document.find(params.id)
    if (!document) {
      return response.notFound({ error: { code: 'DOCUMENT_NOT_FOUND' } })
    }

    return response.attachment(FileStorageService.absolutePath(document), document.fileName)
  }

  async destroy({ params, authUser, response }: HttpContext) {
    const document = await Document.find(params.id)
    if (!document) {
      return response.notFound({ error: { code: 'DOCUMENT_NOT_FOUND' } })
    }

    if (authUser.role !== 'admin' && document.uploadedBy !== authUser.id) {
      return response.forbidden({ error: { code: 'FORBIDDEN' } })
    }

    await document.delete()
    return response.noContent()
  }
}
