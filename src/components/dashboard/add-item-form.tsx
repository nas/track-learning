'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LearningItemSchema, LearningItemType, LearningItemStatus } from '@/lib/schemas/learning-item'
import { useAddItem } from '@/hooks/useAddItem'
import { z } from 'zod'
import { Button } from '@/components/ui/button'

const AddItemSchema = LearningItemSchema.omit({ id: true, lastUpdated: true })
type AddItemInput = z.infer<typeof AddItemSchema>

export function AddItemForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutate, isPending } = useAddItem()
  const { register, handleSubmit, reset } = useForm<AddItemInput>({
    resolver: zodResolver(AddItemSchema),
    defaultValues: {
        title: "",
        author: "",
        type: "Book",
        status: "In Progress",
        progress: "0%",
        url: "",
        startDate: new Date().toISOString()
    }
  })

  const onSubmit = (data: AddItemInput) => {
    mutate(data, {
        onSuccess: () => {
            reset()
            onSuccess?.()
        }
    })
  }

  const inputClasses = "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-semibold tracking-tight">Title</label>
        <input {...register("title")} id="title" className={inputClasses} placeholder="Enter title..." />
      </div>
      <div className="space-y-2">
        <label htmlFor="author" className="text-sm font-semibold tracking-tight">Author</label>
        <input {...register("author")} id="author" className={inputClasses} placeholder="Enter author name..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-semibold tracking-tight">Type</label>
          <select {...register("type")} id="type" className={inputClasses}>
              {LearningItemType.options.map(t => (
                  <option key={t} value={t}>{t}</option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-semibold tracking-tight">Status</label>
          <select {...register("status")} id="status" className={inputClasses}>
              {LearningItemStatus.options.map(s => (
                  <option key={s} value={s}>{s}</option>
              ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="progress" className="text-sm font-semibold tracking-tight">Progress</label>
        <input {...register("progress")} id="progress" className={inputClasses} placeholder="e.g. 50%, Chapter 5..." />
      </div>
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-semibold tracking-tight">URL (optional)</label>
        <input {...register("url")} id="url" type="url" className={inputClasses} placeholder="https://..." />
      </div>
      <Button type="submit" disabled={isPending} className="w-full mt-2">
        {isPending ? 'Adding...' : 'Add Learning Item'}
      </Button>
    </form>
  )
}
