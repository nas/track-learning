import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LearningItem } from '@/lib/schemas/learning-item'

export function useUpdateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<LearningItem> }) => {
      const response = await fetch('/api/learning-items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, updates }),
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
