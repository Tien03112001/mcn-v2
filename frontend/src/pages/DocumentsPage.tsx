import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Download, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDeleteButton } from '@/components/common/ConfirmDeleteButton'
import { PaginationControls } from '@/components/common/PaginationControls'
import { deleteDocument, downloadDocument, getDocumentPreviewUrl, listDocuments, uploadDocument } from '@/lib/api/documents'
import { getErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth-store'
import type { DocumentItem } from '@/types/document'

function formatFileSize(bytes: number | null) {
  if (bytes === null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPreviewable(doc: DocumentItem) {
  if (doc.mimeType?.startsWith('image/')) return true
  if (doc.mimeType === 'application/pdf') return true
  const ext = doc.fileName.split('.').pop()?.toLowerCase()
  return ext === 'pdf' || ext === 'png' || ext === 'jpg' || ext === 'jpeg'
}

function isImage(doc: DocumentItem) {
  if (doc.mimeType?.startsWith('image/')) return true
  const ext = doc.fileName.split('.').pop()?.toLowerCase()
  return ext === 'png' || ext === 'jpg' || ext === 'jpeg'
}

export default function DocumentsPage() {
  const role = useAuthStore((s) => s.user?.role)
  const userId = useAuthStore((s) => s.user?.id)
  const canUpload = role === 'admin' || role === 'teacher'

  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '' })
  const [file, setFile] = useState<File | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page, keyword],
    queryFn: () => listDocuments({ page, keyword: keyword || undefined }),
  })

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('NO_FILE')
      return uploadDocument({
        title: form.title,
        description: form.description || undefined,
        category: form.category || undefined,
        file,
      })
    },
    onSuccess: () => {
      toast.success('Đã tải lên tài liệu')
      setOpen(false)
      setForm({ title: '', description: '', category: '' })
      setFile(null)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, { INVALID_FILE: 'Định dạng file không được hỗ trợ.' }, 'Không thể tải lên tài liệu')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      toast.success('Đã xóa tài liệu')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: () => toast.error('Không thể xóa tài liệu'),
  })

  async function handleDownload(id: number, fileName: string) {
    try {
      await downloadDocument(id, fileName)
    } catch {
      toast.error('Không thể tải xuống tài liệu')
    }
  }

  async function handlePreview(doc: DocumentItem) {
    setPreviewDoc(doc)
    setPreviewLoading(true)
    try {
      const url = await getDocumentPreviewUrl(doc.id)
      setPreviewUrl(url)
    } catch {
      toast.error('Không thể xem trước tài liệu')
      setPreviewDoc(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewDoc(null)
    setPreviewUrl(null)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tài liệu</h1>
          <p className="text-sm text-muted-foreground">Kho tài liệu dùng chung — mọi người đều xem và tải về được.</p>
        </div>
        {canUpload && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Tải lên tài liệu</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tải lên tài liệu mới</DialogTitle>
              </DialogHeader>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  uploadMutation.mutate()
                }}
              >
                <div className="flex flex-col gap-2">
                  <Label>Tiêu đề</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Mô tả (không bắt buộc)</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Danh mục (không bắt buộc)</Label>
                  <Input
                    placeholder="VD: Tin học, Toán, Biểu mẫu..."
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Tệp tin</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={uploadMutation.isPending || !file}>
                    {uploadMutation.isPending ? 'Đang tải lên...' : 'Tải lên'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Input
        placeholder="Tìm theo tiêu đề..."
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value)
          setPage(1)
        }}
        className="mb-4 max-w-xs"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Người tải lên</TableHead>
            <TableHead>Kích thước</TableHead>
            <TableHead>Ngày tải lên</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Đang tải...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && data?.data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Chưa có tài liệu nào.
              </TableCell>
            </TableRow>
          )}
          {data?.data.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                  </div>
                </div>
              </TableCell>
              <TableCell>{doc.category ? <Badge variant="secondary">{doc.category}</Badge> : '—'}</TableCell>
              <TableCell className="text-muted-foreground">{doc.uploadedByName ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{formatFileSize(doc.sizeBytes)}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {isPreviewable(doc) && (
                    <Button variant="outline" size="sm" onClick={() => handlePreview(doc)}>
                      <Eye className="size-3.5" />
                      Xem trước
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc.id, doc.fileName)}>
                    <Download className="size-3.5" />
                    Tải xuống
                  </Button>
                  {(role === 'admin' || doc.uploadedBy === userId) && (
                    <ConfirmDeleteButton
                      title={`Xóa tài liệu "${doc.title}"?`}
                      description="Hành động này không thể hoàn tác."
                      pending={deleteMutation.isPending}
                      onConfirm={() => deleteMutation.mutate(doc.id)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data && (
        <PaginationControls
          currentPage={data.metadata.currentPage}
          lastPage={data.metadata.lastPage}
          total={data.metadata.total}
          perPage={data.metadata.perPage}
          onPageChange={setPage}
        />
      )}

      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="w-[90vw] max-w-7xl sm:max-w-7xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex h-[75vh] items-center justify-center overflow-auto rounded-lg bg-muted/30">
            {previewLoading && <p className="text-sm text-muted-foreground">Đang tải xem trước...</p>}
            {!previewLoading && previewUrl && previewDoc && (
              <>
                {isImage(previewDoc) ? (
                  <img src={previewUrl} alt={previewDoc.title} className="max-h-full max-w-full object-contain" />
                ) : (
                  <iframe src={previewUrl} title={previewDoc.title} className="h-full w-full rounded-lg" />
                )}
              </>
            )}
          </div>
          {previewDoc && (
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDownload(previewDoc.id, previewDoc.fileName)}>
                <Download className="size-3.5" />
                Tải xuống
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
