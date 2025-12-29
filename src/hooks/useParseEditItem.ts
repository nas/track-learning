import { useMutation } from '@tanstack/react-query'
import { LearningItem } from '@/lib/schemas/learning-item'

export type EditItemUpdates = {
  status?: string
  progress?: string
  url?: string
}

export function useParseEditItem() {
  return useMutation({
    mutationFn: async ({
      message,
      item,
    }: {
      message: string
      item: LearningItem
    }): Promise<EditItemUpdates> => {
      const response = await fetch('/api/learning-items/parse-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, item }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const json = await response.json()
      return json.updates as EditItemUpdates
    },
  })
}

