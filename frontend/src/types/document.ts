export interface DocumentItem {
  id: number
  title: string
  description: string | null
  category: string | null
  fileName: string
  mimeType: string | null
  sizeBytes: number | null
  uploadedBy: number
  uploadedByName: string | null
  createdAt: string
}
