import { Link } from 'react-router-dom'
import {
  BookOpenCheck,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: 'Ngân hàng đề thi phong phú',
    description: 'Kho câu hỏi đa dạng theo môn học, chủ đề và mức độ, dễ dàng tìm kiếm và tái sử dụng.',
  },
  {
    icon: ClipboardCheck,
    title: 'Thi online linh hoạt',
    description: 'Tạo đề thi, thiết lập thời gian và tổ chức kỳ thi trực tuyến chỉ trong vài bước.',
  },
  {
    icon: BarChart3,
    title: 'Thống kê kết quả tức thì',
    description: 'Chấm điểm tự động và phân tích kết quả chi tiết ngay sau khi thí sinh nộp bài.',
  },
  {
    icon: ShieldCheck,
    title: 'Bảo mật & minh bạch',
    description: 'Quản lý quyền truy cập theo vai trò, đảm bảo an toàn dữ liệu và tính công bằng.',
  },
]

const STATS = [
  { label: 'Câu hỏi trong ngân hàng đề', value: '10,000+' },
  { label: 'Lượt thi đã tổ chức', value: '5,000+' },
  { label: 'Giáo viên & giảng viên', value: '200+' },
]

const STEPS = [
  {
    icon: Users,
    title: 'Đăng nhập vào hệ thống',
    description: 'Giáo viên và học viên đăng nhập bằng tài khoản được cấp để bắt đầu.',
  },
  {
    icon: Sparkles,
    title: 'Soạn đề hoặc chọn đề có sẵn',
    description: 'Xây dựng đề thi từ ngân hàng câu hỏi hoặc dùng đề đã được chuẩn bị sẵn.',
  },
  {
    icon: Timer,
    title: 'Làm bài & nhận kết quả',
    description: 'Học viên làm bài trực tuyến, kết quả và phân tích được trả về ngay lập tức.',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenCheck className="size-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">MCN</span>
          </div>
          <Button asChild variant="outline">
            <Link to="/login">Đăng nhập</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--color-muted),transparent)]"
          />
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Sparkles className="size-3.5" />
              Nền tảng thi trực tuyến toàn diện
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Ngân hàng đề thi &amp; Thi online
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-balance">
              Định vị tri thức — dẫn lối tư duy. Xây dựng đề thi, tổ chức thi trực tuyến và theo dõi
              kết quả học tập một cách chính xác, nhanh chóng và minh bạch.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/login">
                  Đăng nhập ngay
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">Tìm hiểu thêm</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-3xl font-semibold tracking-tight">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Vì sao chọn nền tảng của chúng tôi</h2>
            <p className="text-muted-foreground">
              Mọi công cụ cần thiết để quản lý ngân hàng đề thi và tổ chức thi online, tất cả trong một nơi.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Bắt đầu chỉ với 3 bước</h2>
              <p className="text-muted-foreground">Quy trình đơn giản, phù hợp cho cả giáo viên và học viên.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative flex flex-col items-center gap-3 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-background text-primary ring-1 ring-foreground/10">
                    <step.icon className="size-5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Bước {index + 1}</span>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 py-24 text-center">
          <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card px-8 py-14 ring-1 ring-foreground/10">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Sẵn sàng nâng cao hiệu quả thi cử?
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Đăng nhập ngay để truy cập ngân hàng đề thi và bắt đầu tổ chức kỳ thi trực tuyến của bạn.
            </p>
            <Button asChild size="lg">
              <Link to="/login">
                Đăng nhập
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} MCN. Định vị tri thức — dẫn lối tư duy.</span>
          <span>Ngân hàng đề thi &amp; Thi online</span>
        </div>
      </footer>
    </div>
  )
}
