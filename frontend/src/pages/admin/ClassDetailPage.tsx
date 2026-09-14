import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { importClassStudents, listClassStudents, removeClassStudent } from '@/lib/api/admin'

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const classId = Number(id)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const queryClient = useQueryClient()

  const { data: students, isLoading } = useQuery({
    queryKey: ['admin', 'classes', classId, 'students'],
    queryFn: () => listClassStudents(classId),
  })

  const removeMutation = useMutation({
    mutationFn: (studentId: number) => removeClassStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes', classId, 'students'] })
    },
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => importClassStudents(classId, file),
    onSuccess: (result) => {
      toast.success(`Import thành công: ${result.created} SV mới, ${result.enrolled} lượt ghi danh`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes', classId, 'students'] })
    },
    onError: () => toast.error('Import thất bại. Kiểm tra định dạng file Excel.'),
    onSettled: () => setIsImporting(false),
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    importMutation.mutate(file)
    e.target.value = ''
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách sinh viên</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            {isImporting ? 'Đang import...' : 'Import Excel'}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mã SV</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Đang tải...
              </TableCell>
            </TableRow>
          )}
          {students?.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.fullName}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.studentCode ?? '—'}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMutation.mutate(student.id)}
                  disabled={removeMutation.isPending}
                >
                  Xóa khỏi lớp
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
