import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { addClassStudent, importClassStudents, listClassStudents, listUsers, removeClassStudent } from '@/lib/api/admin'

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const classId = Number(id)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const queryClient = useQueryClient()

  const { data: students, isLoading } = useQuery({
    queryKey: ['admin', 'classes', classId, 'students'],
    queryFn: () => listClassStudents(classId),
  })

  const { data: allStudents } = useQuery({
    queryKey: ['admin', 'users', 'student', 'all'],
    queryFn: () => listUsers({ role: 'student', perPage: 1000 }),
    enabled: addOpen,
  })

  const enrolledIds = new Set(students?.map((s) => s.id))
  const availableStudents = (allStudents?.data ?? []).filter((s) => !enrolledIds.has(s.id))
  const filteredStudents = availableStudents.filter((s) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.studentCode ?? '').toLowerCase().includes(q)
    )
  })

  const removeMutation = useMutation({
    mutationFn: (studentId: number) => removeClassStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes', classId, 'students'] })
    },
  })

  const addMutation = useMutation({
    mutationFn: (studentId: number) => addClassStudent(classId, studentId),
    onSuccess: () => {
      toast.success('Đã thêm sinh viên vào lớp')
      setAddOpen(false)
      setSearch('')
      setSelectedStudentId('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes', classId, 'students'] })
    },
    onError: () => toast.error('Không thể thêm sinh viên vào lớp'),
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
        <div className="flex gap-2">
          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open)
              if (!open) {
                setSearch('')
                setSelectedStudentId('')
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">Thêm sinh viên</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm sinh viên vào lớp</DialogTitle>
              </DialogHeader>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (selectedStudentId) addMutation.mutate(Number(selectedStudentId))
                }}
              >
                <div className="flex flex-col gap-2">
                  <Label>Tìm sinh viên</Label>
                  <Input
                    placeholder="Tìm theo tên, email hoặc mã SV..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Sinh viên</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sinh viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStudents.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Không tìm thấy sinh viên phù hợp
                        </div>
                      ) : (
                        filteredStudents.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.fullName} — {s.email}
                            {s.studentCode ? ` (${s.studentCode})` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Không thấy sinh viên cần tìm? Tạo tài khoản mới ở trang{' '}
                    <Link to="/admin/users" className="underline">
                      Người dùng
                    </Link>
                    .
                  </p>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!selectedStudentId || addMutation.isPending}>
                    {addMutation.isPending ? 'Đang thêm...' : 'Thêm vào lớp'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

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
