import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AddLearningItemInput } from '@/lib/schemas/learning-item'

export function useAddItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: AddLearningItemInput) => {
      const response = await fetch('/api/learning-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-items'] })
    },
  })
}
