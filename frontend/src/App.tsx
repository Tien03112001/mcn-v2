import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { router } from '@/routes/router'
import { useBootstrapAuth } from '@/hooks/use-auth'

function AuthBootstrap() {
  useBootstrapAuth()
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}
