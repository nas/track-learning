'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LearningItem, LearningItemSchema, LearningItemStatus } from '@/lib/schemas/learning-item'
import { useUpdateItem } from '@/hooks/useUpdateItem'
import { z } from 'zod'

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

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || <button className="text-sm text-blue-500">Edit</button>}
      </div>
      
      {isOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-foreground">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Item</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium">Status</label>
                <select {...register("status")} id="status" className="border p-2 rounded w-full bg-background">
                    {LearningItemStatus.options.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="progress" className="block text-sm font-medium">Progress</label>
                <input {...register("progress")} id="progress" className="border p-2 rounded w-full bg-background" />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium">URL</label>
                <input {...register("url")} id="url" type="url" className="border p-2 rounded w-full bg-background" placeholder="https://..." />
              </div>
              <div className="flex justify-between items-center pt-4">
                <button type="button" onClick={onArchive} className="text-red-500 text-sm hover:underline">
                    Archive Item
                </button>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="p-2 text-sm">Cancel</button>
                    <button type="submit" disabled={isPending} className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                        {isPending ? 'Saving...' : 'Save'}
                    </button>
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
