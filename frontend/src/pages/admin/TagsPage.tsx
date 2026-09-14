import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createTag, deleteTag, listTags } from '@/lib/api/admin'

export default function TagsPage() {
  const [name, setName] = useState('')
  const queryClient = useQueryClient()

  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: listTags,
  })

  const createMutation = useMutation({
    mutationFn: () => createTag(name),
    onSuccess: () => {
      setName('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
    },
    onError: () => toast.error('Không thể tạo tag (tên có thể đã tồn tại)'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] }),
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Tag kỳ thi</h1>

      <form
        className="mb-6 flex max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) createMutation.mutate()
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: THPT Quốc Gia, HSA, V-ACT..."
        />
        <Button type="submit" disabled={createMutation.isPending}>
          Thêm
        </Button>
      </form>

      {isLoading && <p className="text-muted-foreground">Đang tải...</p>}

      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="gap-1 py-1.5 pr-1.5 text-sm">
            {tag.name}
            <button
              onClick={() => deleteMutation.mutate(tag.id)}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              aria-label={`Xóa tag ${tag.name}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
