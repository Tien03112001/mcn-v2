export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold">403 — Không có quyền truy cập</h1>
      <p className="text-muted-foreground">Bạn không có quyền xem trang này.</p>
    </div>
  )
}
