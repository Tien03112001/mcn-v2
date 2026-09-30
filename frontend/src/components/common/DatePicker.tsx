import { useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = 'Chọn ngày', className }: DatePickerProps) {
  const selected = value ? parseISO(value) : null
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(selected ?? new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth)),
    end: endOfWeek(endOfMonth(viewMonth)),
  })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) setViewMonth(selected ?? new Date())
  }

  function selectDay(day: Date) {
    onChange(format(day, 'yyyy-MM-dd'))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('h-8 justify-start gap-1.5 px-2.5 font-normal', !selected && 'text-muted-foreground', className)}
        >
          <CalendarIcon className="size-3.5" />
          {selected ? format(selected, 'dd/MM/yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium">
            Tháng {viewMonth.getMonth() + 1}, {viewMonth.getFullYear()}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="flex h-7 items-center justify-center text-xs text-muted-foreground">
              {label}
            </div>
          ))}
          {days.map((day) => {
            const isSelected = selected && isSameDay(day, selected)
            const inMonth = isSameMonth(day, viewMonth)
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => selectDay(day)}
                className={cn(
                  'flex size-7 cursor-pointer items-center justify-center rounded-md text-sm hover:bg-accent',
                  !inMonth && 'text-muted-foreground/50',
                  isToday(day) && !isSelected && 'ring-1 ring-ring',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            Xóa
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const today = new Date()
              setViewMonth(today)
              selectDay(today)
            }}
          >
            Hôm nay
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
