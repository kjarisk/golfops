import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useDocuments, useDeleteDocument } from '../api/useKnowledge'
import { KNOWLEDGE_CATEGORIES } from '../types'
import type { KnowledgeDocument } from '../types'
import { DocumentForm } from './DocumentForm'

function CategoryPills({
  active,
  onChange,
}: {
  active: string
  onChange: (cat: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {['All', ...KNOWLEDGE_CATEGORIES].map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            active === cat
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

function DocumentRow({
  doc,
  onEdit,
  onDelete,
}: {
  doc: KnowledgeDocument
  onEdit: () => void
  onDelete: () => void
}) {
  const preview =
    doc.content.length > 120 ? doc.content.slice(0, 120) + '…' : doc.content

  return (
    <tr className="transition-colors hover:bg-muted/20">
      <td className="px-4 py-3 font-medium text-foreground">{doc.title}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {doc.category}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
        <span className="line-clamp-2">{preview}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center">
      <p className="text-sm font-medium text-foreground">
        {filtered ? 'No documents in this category' : 'No documents yet'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {filtered
          ? 'Select a different category or add a new document.'
          : 'Add the first document to get started.'}
      </p>
    </div>
  )
}

export function KnowledgePage() {
  const { data: documents, isLoading, error } = useDocuments()
  const deleteDoc = useDeleteDocument()

  const [activeCategory, setActiveCategory] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editDoc, setEditDoc] = useState<KnowledgeDocument | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<
    KnowledgeDocument | undefined
  >()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-destructive">
          Failed to load documents: {(error as Error).message}
        </p>
      </div>
    )
  }

  const filtered =
    activeCategory === 'All'
      ? (documents ?? [])
      : (documents ?? []).filter((d) => d.category === activeCategory)

  function openEdit(doc: KnowledgeDocument) {
    setEditDoc(doc)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditDoc(undefined)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteDoc.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Document deleted')
        setDeleteTarget(undefined)
      },
      onError: () => toast.error('Failed to delete document'),
    })
  }

  return (
    <div className="min-h-svh bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Knowledge base
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {documents?.length ?? 0} documents
            </p>
          </div>
          <Button
            onClick={() => {
              setEditDoc(undefined)
              setFormOpen(true)
            }}
          >
            Add document
          </Button>
        </div>

        <div className="mb-4">
          <CategoryPills active={activeCategory} onChange={setActiveCategory} />
        </div>

        <DocumentForm open={formOpen} onClose={closeForm} document={editDoc} />

        {filtered.length === 0 ? (
          <EmptyState filtered={activeCategory !== 'All'} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Content
                  </th>
                  <th scope="col" className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    onEdit={() => openEdit(doc)}
                    onDelete={() => setDeleteTarget(doc)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o: boolean) => !o && setDeleteTarget(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(undefined)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteDoc.isPending}
              onClick={confirmDelete}
            >
              {deleteDoc.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
