import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import env from '#start/env'
import FileAttachment from '#models/file_attachment'

const ALLOWED_MIME_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf']

/**
 * Stores uploaded files under storage/uploads (outside public/), never
 * served as static assets — every read goes through a route that checks
 * ownership first (see files controller).
 */
export default class FileStorageService {
  static async storeQuestionAttachment(
    file: MultipartFile,
    questionId: number,
    uploadedBy: number
  ): Promise<FileAttachment> {
    const subDir = join('questions', String(questionId))
    const fileName = `${randomUUID()}.${file.extname}`

    await file.move(app.makePath(env.get('STORAGE_DISK_PATH'), subDir), { name: fileName })

    return FileAttachment.create({
      questionId,
      examId: null,
      fileName: file.clientName,
      storedPath: join(subDir, fileName),
      mimeType: file.headers['content-type'] ?? null,
      sizeBytes: file.size,
      uploadedBy,
    })
  }

  static absolutePath(attachment: FileAttachment): string {
    return app.makePath(env.get('STORAGE_DISK_PATH'), attachment.storedPath)
  }

  static get allowedExtensions(): string[] {
    return ALLOWED_MIME_EXTENSIONS
  }
}
