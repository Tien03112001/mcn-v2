import apiClient from '@/lib/api-client'
import type { PaginatedResponse } from '@/lib/api/admin'
import type { DocumentItem, DocumentUploader } from '@/types/document'

export async function listDocuments(params?: {
  page?: number
  perPage?: number
  keyword?: string
  subjectId?: number
  uploadedBy?: number
  from?: string
  to?: string
}) {
  const { data } = await apiClient.get<PaginatedResponse<DocumentItem>>('/documents', { params })
  return data
}

export async function listDocumentUploaders() {
  const { data } = await apiClient.get<{ data: DocumentUploader[] }>('/documents/uploaders')
  return data.data
}

export async function uploadDocument(payload: {
  title: string
  description?: string
  subjectId?: number
  file: File
}) {
  const formData = new FormData()
  formData.append('title', payload.title)
  if (payload.description) formData.append('description', payload.description)
  if (payload.subjectId) formData.append('subjectId', String(payload.subjectId))
  formData.append('file', payload.file)

  const { data } = await apiClient.post<{ data: DocumentItem }>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function deleteDocument(id: number) {
  await apiClient.delete(`/documents/${id}`)
}

/**
 * Downloads (and previews) use a bearer token (no auth cookie), so a plain
 * <a href>/<iframe src> can't authenticate — fetch as a blob instead. The
 * resulting object URL renders per the blob's own MIME type, unaffected by
 * the response's Content-Disposition: attachment header.
 */
async function fetchDocumentBlob(id: number): Promise<Blob> {
  const response = await apiClient.get(`/documents/${id}/download`, { responseType: 'blob' })
  return response.data as Blob
}

export async function downloadDocument(id: number, fileName: string) {
  const blob = await fetchDocumentBlob(id)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Caller owns the returned object URL and must revoke it when done. */
export async function getDocumentPreviewUrl(id: number): Promise<string> {
  const blob = await fetchDocumentBlob(id)
  return URL.createObjectURL(blob)
}
