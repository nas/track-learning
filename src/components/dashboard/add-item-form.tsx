'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LearningItemSchema, LearningItemType, LearningItemStatus } from '@/lib/schemas/learning-item'
import { useAddItem } from '@/hooks/useAddItem'
import { z } from 'zod'

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <input {...register("title")} id="title" className="border p-2 rounded w-full" />
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-medium">Author</label>
        <input {...register("author")} id="author" className="border p-2 rounded w-full" />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium">Type</label>
        <select {...register("type")} id="type" className="border p-2 rounded w-full">
            {LearningItemType.options.map(t => (
                <option key={t} value={t}>{t}</option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium">Status</label>
        <select {...register("status")} id="status" className="border p-2 rounded w-full">
            {LearningItemStatus.options.map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="progress" className="block text-sm font-medium">Progress</label>
        <input {...register("progress")} id="progress" className="border p-2 rounded w-full" />
      </div>
      <button type="submit" disabled={isPending} className="bg-blue-500 text-white p-2 rounded w-full">
        {isPending ? 'Adding...' : 'Add Item'}
      </button>
    </form>
  )
}