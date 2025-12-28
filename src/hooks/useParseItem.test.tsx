import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { useParseItem } from './useParseItem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

describe('useParseItem', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  test('posts message for parsing', async () => {
    const parsedItem = {
      title: 'New Item',
      author: 'Me',
      type: 'Article',
      status: 'In Progress',
      progress: '0%',
      startDate: '2025-01-01T00:00:00.000Z',
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ item: parsedItem }),
    } as Response)

    const { result } = renderHook(() => useParseItem(), { wrapper })

    result.current.mutate('Parse this' as any)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/learning-items/parse',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Parse this' }),
      })
    )
  })
})
