import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ViolationWarningDialogProps {
  open: boolean
  violationCount: number
  maxViolationCount: number
  onDismiss: () => void
}

export default function ViolationWarningDialog({
  open,
  violationCount,
  maxViolationCount,
  onDismiss,
}: ViolationWarningDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cảnh báo giám sát</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn vừa rời khỏi màn hình làm bài. Đây là vi phạm lần {violationCount}/{maxViolationCount}.
            Vi phạm quá {maxViolationCount} lần, bài thi sẽ tự động bị nộp.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onDismiss}>Đã hiểu, tiếp tục làm bài</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
