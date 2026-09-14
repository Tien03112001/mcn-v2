import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Ngân hàng đề thi &amp; Thi online</h1>
        <p className="mt-2 text-muted-foreground">Định vị tri thức — dẫn lối tư duy</p>
      </div>
      <Button asChild size="lg">
        <Link to="/login">Đăng nhập</Link>
      </Button>
    </div>
  )
}
