import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { useLearningItems } from './useLearningItems'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockItems = [
  { id: "1", title: "Test Item", author: "Author", type: "Book", status: "In Progress", progress: "10%", startDate: "", lastUpdated: "" }
]

describe('useLearningItems', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  test('fetches learning items via API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockItems,
    } as Response)

    const { result } = renderHook(() => useLearningItems(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockItems)
    expect(global.fetch).toHaveBeenCalledWith('/api/learning-items')
  })
})