import { useMutation } from '@tanstack/react-query'

export type SearchCriteria = {
  searchText?: string
  type?: string
  status?: string
  progressMin?: string
  progressMax?: string
}

export function useParseSearch() {
  return useMutation({
    mutationFn: async (query: string): Promise<SearchCriteria> => {
      const response = await fetch('/api/learning-items/parse-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const json = await response.json()
      return json.criteria as SearchCriteria
    },
  })
}

