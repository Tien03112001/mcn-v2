import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
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
import { PaginationControls } from '@/components/common/PaginationControls'
import { listUsers } from '@/lib/api/admin'
import {
  addExamRoomStudent,
  importExamRoomStudents,
  listExamRooms,
  listExamRoomStudents,
  removeExamRoomStudent,
} from '@/lib/api/exams'

export default function ExamRoomDetailPage() {
  const { examId, roomId } = useParams<{ examId: string; roomId: string }>()
  const examIdNum = Number(examId)
  const roomIdNum = Number(roomId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const studentsBaseKey = ['teacher', 'exams', examIdNum, 'rooms', roomIdNum, 'students']
  const studentsQueryKey = [...studentsBaseKey, page]

  const { data: rooms } = useQuery({
    queryKey: ['teacher', 'exams', examIdNum, 'rooms'],
    queryFn: () => listExamRooms(examIdNum),
  })
  const room = rooms?.find((r) => r.id === roomIdNum)

  const { data: studentsPage, isLoading } = useQuery({
    queryKey: studentsQueryKey,
    queryFn: () => listExamRoomStudents(examIdNum, roomIdNum, { page }),
  })
  const students = studentsPage?.data

  // Full (unpaginated) roster, fetched only while the add-student dialog is
  // open, so "already enrolled" filtering isn't limited to the current page.
  const { data: allEnrolled } = useQuery({
    queryKey: ['teacher', 'exams', examIdNum, 'rooms', roomIdNum, 'students', 'all'],
    queryFn: () => listExamRoomStudents(examIdNum, roomIdNum, { perPage: 1000 }),
    enabled: addOpen,
  })

  const { data: allStudents } = useQuery({
    queryKey: ['admin', 'users', 'student', 'all'],
    queryFn: () => listUsers({ role: 'student', perPage: 1000 }),
    enabled: addOpen,
  })

  const enrolledIds = new Set(allEnrolled?.data.map((s) => s.id))
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
    mutationFn: (studentId: number) => removeExamRoomStudent(examIdNum, roomIdNum, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsBaseKey })
    },
  })

  const addMutation = useMutation({
    mutationFn: (studentId: number) => addExamRoomStudent(examIdNum, roomIdNum, studentId),
    onSuccess: () => {
      toast.success('Đã thêm sinh viên vào phòng thi')
      setAddOpen(false)
      setSearch('')
      setSelectedStudentId('')
      queryClient.invalidateQueries({ queryKey: studentsBaseKey })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể thêm sinh viên vào phòng thi')),
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => importExamRoomStudents(examIdNum, roomIdNum, file),
    onSuccess: (result) => {
      toast.success(`Import thành công: ${result.created} SV mới, ${result.enrolled} lượt ghi danh`)
      queryClient.invalidateQueries({ queryKey: studentsBaseKey })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Import thất bại. Kiểm tra định dạng file Excel.')),
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
      <Link
        to={`/teacher/exams/${examIdNum}`}
        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Quay lại đề thi
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{room ? `Phòng thi: ${room.name}` : 'Danh sách sinh viên'}</h1>
          <p className="text-sm text-muted-foreground">Quản lý danh sách sinh viên của phòng thi này.</p>
        </div>
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
              <Button variant="outline">Thêm thủ công</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm sinh viên vào phòng thi</DialogTitle>
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
                    {addMutation.isPending ? 'Đang thêm...' : 'Thêm vào phòng thi'}
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
                  Xóa khỏi phòng thi
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {studentsPage && (
        <PaginationControls
          currentPage={studentsPage.metadata.currentPage}
          lastPage={studentsPage.metadata.lastPage}
          total={studentsPage.metadata.total}
          perPage={studentsPage.metadata.perPage}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
