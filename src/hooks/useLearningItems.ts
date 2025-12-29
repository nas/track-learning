import { useQuery } from '@tanstack/react-query'
import { LearningItem } from '@/lib/schemas/learning-item'

export function useLearningItems() {
  return useQuery<LearningItem[]>({
    queryKey: ['learning-items'],
    queryFn: async () => {
      const response = await fetch('/api/learning-items')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    refetchOnWindowFocus: false,
  })
}
