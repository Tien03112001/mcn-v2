import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout as logoutRequest } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'

export interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

interface AppLayoutProps {
  navItems: NavItem[]
  title: string
}

export default function AppLayout({ navItems, title }: AppLayoutProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      logoutStore()
      navigate('/login', { replace: true })
    },
  })

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 border-r bg-muted/30 md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4 font-semibold">{title}</div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground font-medium'
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="md:hidden font-semibold">{title}</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.fullName}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="text-xs font-medium">{user?.initials}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 size-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
