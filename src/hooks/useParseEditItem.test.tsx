import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { useParseEditItem } from './useParseEditItem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { LearningItem } from '@/lib/schemas/learning-item'

describe('useParseEditItem', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const mockItem: LearningItem = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    type: 'Book',
    status: 'In Progress',
    progress: '50%',
    url: 'https://example.com',
    startDate: '2025-01-01T00:00:00.000Z',
    lastUpdated: '2025-01-01T00:00:00.000Z',
  }

  test('posts message and item for parsing', async () => {
    const parsedUpdates = {
      status: 'Completed',
      progress: '100%',
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ updates: parsedUpdates }),
    } as Response)

    const { result } = renderHook(() => useParseEditItem(), { wrapper })

    result.current.mutate({ message: 'mark as completed', item: mockItem })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/learning-items/parse-edit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'mark as completed', item: mockItem }),
      })
    )
  })
})

