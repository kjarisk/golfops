import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateActivity } from '../api/useActivities'

const ACTIVITY_TYPES = [
  'VTG',
  'Kurs',
  'Banespill',
  'Trening',
  'Turnering',
  'Privat',
]

const schema = z.object({
  title: z.string().min(1, 'Required'),
  activityType: z.string().min(1, 'Required'),
  startTime: z.string().min(1, 'Required'),
  endTime: z.string().optional(),
  location: z.string().optional(),
  capacity: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().int().positive().optional()
  ),
  requiresGolfboxReservation: z.boolean(),
  golfboxReservationNote: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export function ActivityForm({ open, onClose }: Props) {
  const create = useCreateActivity()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { requiresGolfboxReservation: false },
  })

  const needsGolfbox = watch('requiresGolfboxReservation')

  function close() {
    reset()
    onClose()
  }

  function onSubmit(values: FormValues) {
    create.mutate(
      {
        ...values,
        startTime: new Date(values.startTime).toISOString(),
        endTime: values.endTime
          ? new Date(values.endTime).toISOString()
          : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Activity added')
          close()
        },
        onError: () => toast.error('Failed to save activity'),
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && close()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add activity</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="VTG Onsdagskveld"
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="activityType">Type</Label>
            <Select
              onValueChange={(v: string) =>
                setValue('activityType', v, { shouldValidate: true })
              }
            >
              <SelectTrigger id="activityType">
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activityType && (
              <p className="text-xs text-destructive">
                {errors.activityType.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startTime">Start</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register('startTime')}
              />
              {errors.startTime && (
                <p className="text-xs text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endTime">End (optional)</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register('endTime')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ekebergbanen"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="capacity">Capacity (optional)</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              {...register('capacity')}
              placeholder="12"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="requiresGolfboxReservation"
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
              {...register('requiresGolfboxReservation')}
            />
            <Label
              htmlFor="requiresGolfboxReservation"
              className="cursor-pointer"
            >
              Requires GolfBox reservation
            </Label>
          </div>

          {needsGolfbox && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="golfboxReservationNote">
                Reservation note (optional)
              </Label>
              <Input
                id="golfboxReservationNote"
                {...register('golfboxReservationNote')}
                placeholder="e.g. Call Ekebergbanen for large groups"
              />
            </div>
          )}

          <SheetFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving…' : 'Save activity'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
