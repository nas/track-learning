import { useMutation } from '@tanstack/react-query'
import { AddLearningItemInput } from '@/lib/schemas/learning-item'

export function useParseItem() {
  return useMutation({
    mutationFn: async (message: string): Promise<AddLearningItemInput> => {
      const response = await fetch('/api/learning-items/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const json = await response.json()
      return json.item as AddLearningItemInput
    },
  })
}
