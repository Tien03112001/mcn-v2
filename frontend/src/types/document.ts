export interface DocumentItem {
  id: number
  title: string
  description: string | null
  subjectId: number | null
  subjectName: string | null
  fileName: string
  mimeType: string | null
  sizeBytes: number | null
  uploadedBy: number
  uploadedByName: string | null
  createdAt: string
}

export interface DocumentUploader {
  id: number
  fullName: string
}
