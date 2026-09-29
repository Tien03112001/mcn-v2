import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import env from '#start/env'
import FileAttachment from '#models/file_attachment'

const ALLOWED_MIME_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf']
const ALLOWED_DOCUMENT_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'zip',
  'png',
  'jpg',
  'jpeg',
]

export interface StoredFile {
  fileName: string
  storedPath: string
  mimeType: string | null
  sizeBytes: number
}

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

  /** Moves an uploaded file into storage and returns its metadata — the
   *  caller is responsible for persisting it on whatever model owns it
   *  (question attachment, shared document, ...). */
  static async storeFile(file: MultipartFile, subDir: string): Promise<StoredFile> {
    const fileName = `${randomUUID()}.${file.extname}`
    await file.move(app.makePath(env.get('STORAGE_DISK_PATH'), subDir), { name: fileName })

    return {
      fileName: file.clientName,
      storedPath: join(subDir, fileName),
      mimeType: file.headers['content-type'] ?? null,
      sizeBytes: file.size,
    }
  }

  static absolutePath(file: { storedPath: string }): string {
    return app.makePath(env.get('STORAGE_DISK_PATH'), file.storedPath)
  }

  static get allowedExtensions(): string[] {
    return ALLOWED_MIME_EXTENSIONS
  }

  static get allowedDocumentExtensions(): string[] {
    return ALLOWED_DOCUMENT_EXTENSIONS
  }
}
