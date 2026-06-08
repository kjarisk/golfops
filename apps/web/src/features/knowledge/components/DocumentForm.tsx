import { useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateDocument, useUpdateDocument } from '../api/useKnowledge'
import { KNOWLEDGE_CATEGORIES } from '../types'
import type { KnowledgeDocument, KnowledgeCategory } from '../types'

const schema = z.object({
  title: z.string().min(1, 'Required'),
  category: z.enum(KNOWLEDGE_CATEGORIES as unknown as [string, ...string[]]),
  content: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  document?: KnowledgeDocument
}

export function DocumentForm({ open, onClose, document }: Props) {
  const create = useCreateDocument()
  const update = useUpdateDocument()
  const isEdit = !!document

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      if (document) {
        reset({
          title: document.title,
          category: document.category,
          content: document.content,
        })
      } else {
        reset({ title: '', category: undefined, content: '' })
      }
    }
  }, [open, document, reset])

  function close() {
    reset()
    onClose()
  }

  function onSubmit(values: FormValues) {
    const payload = {
      title: values.title,
      category: values.category as KnowledgeCategory,
      content: values.content,
    }

    if (isEdit) {
      update.mutate(
        { id: document.id, ...payload },
        {
          onSuccess: () => {
            toast.success('Document saved')
            close()
          },
          onError: () => toast.error('Failed to save document'),
        }
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success('Document created')
          close()
        },
        onError: () => toast.error('Failed to create document'),
      })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && close()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEdit ? 'Edit document' : 'Add document'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              {...register('title')}
              placeholder="e.g. Green fee prices 2026"
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-category">Category</Label>
            <Select
              defaultValue={document?.category}
              onValueChange={(v: string) =>
                setValue('category', v as KnowledgeCategory, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="doc-category">
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                {KNOWLEDGE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-content">Content</Label>
            <Textarea
              id="doc-content"
              {...register('content')}
              placeholder="Enter document content…"
              className="min-h-48"
            />
            {errors.content && (
              <p className="text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          <SheetFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Saving…'
                : isEdit
                  ? 'Save changes'
                  : 'Create document'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
