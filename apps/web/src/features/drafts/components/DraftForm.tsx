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
import { Textarea } from '@/components/ui/textarea'
import { useCreateDraft } from '../api/useDrafts'

const schema = z.object({
  to: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
  sourceThreadId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  prefill?: { to?: string; subject?: string; sourceThreadId?: string }
}

export function DraftForm({ open, onClose, prefill }: Props) {
  const create = useCreateDraft()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      to: prefill?.to ?? '',
      subject: prefill?.subject ?? '',
      body: '',
      sourceThreadId: prefill?.sourceThreadId ?? '',
    },
  })

  function close() {
    reset()
    onClose()
  }

  function onSubmit(values: FormValues) {
    create.mutate(
      {
        to: values.to,
        subject: values.subject,
        body: values.body,
        sourceThreadId: values.sourceThreadId || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Draft saved')
          close()
        },
        onError: () => toast.error('Failed to save draft'),
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && close()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Compose draft</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="draft-to">To</Label>
            <Input
              id="draft-to"
              type="email"
              {...register('to')}
              placeholder="recipient@example.com"
              autoFocus
            />
            {errors.to && (
              <p className="text-xs text-destructive">{errors.to.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="draft-subject">Subject</Label>
            <Input
              id="draft-subject"
              {...register('subject')}
              placeholder="Re: Your enquiry"
            />
            {errors.subject && (
              <p className="text-xs text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="draft-body">Body</Label>
            <Textarea
              id="draft-body"
              {...register('body')}
              placeholder="Write your message…"
              className="min-h-48"
            />
            {errors.body && (
              <p className="text-xs text-destructive">{errors.body.message}</p>
            )}
          </div>

          <SheetFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving…' : 'Save draft'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
