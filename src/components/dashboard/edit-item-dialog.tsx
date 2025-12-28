'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LearningItem, LearningItemSchema, LearningItemStatus } from '@/lib/schemas/learning-item'
import { useUpdateItem } from '@/hooks/useUpdateItem'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Pencil, Archive, X, Check } from 'lucide-react'

const EditItemSchema = LearningItemSchema.pick({ status: true, progress: true, url: true })
type EditItemInput = z.infer<typeof EditItemSchema>

interface EditItemDialogProps {
  item: LearningItem
  trigger?: React.ReactNode
}

export function EditItemDialog({ item, trigger }: EditItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate, isPending } = useUpdateItem()
  const { register, handleSubmit } = useForm<EditItemInput>({
    resolver: zodResolver(EditItemSchema),
    defaultValues: {
        status: item.status,
        progress: item.progress,
        url: item.url || ""
    }
  })

  const onSubmit = (data: EditItemInput) => {
    mutate({ id: item.id, updates: data }, {
        onSuccess: () => {
            setIsOpen(false)
        }
    })
  }

  const onArchive = () => {
    if (confirm("Are you sure you want to archive this item?")) {
        mutate({ id: item.id, updates: { status: "Archived" } }, {
            onSuccess: () => setIsOpen(false)
        })
    }
  }

  const inputClasses = "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-blue-600">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>
      
      {isOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-foreground">
          <div className="bg-background p-7 rounded-2xl shadow-2xl w-full max-w-md border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold tracking-tight">Edit Learning Item</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-semibold tracking-tight">Status</label>
                <select {...register("status")} id="status" className={inputClasses}>
                    {LearningItemStatus.options.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="progress" className="text-sm font-semibold tracking-tight">Progress</label>
                <input {...register("progress")} id="progress" className={inputClasses} />
              </div>
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-semibold tracking-tight">URL</label>
                <input {...register("url")} id="url" type="url" className={inputClasses} placeholder="https://..." />
              </div>
              <div className="flex justify-between items-center pt-4">
                <Button type="button" variant="danger" size="sm" onClick={onArchive} className="gap-2">
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                </Button>
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isPending} className="gap-2">
                        {isPending ? 'Saving...' : (
                          <>
                            <Check className="h-4 w-4" />
                            Save
                          </>
                        )}
                    </Button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
