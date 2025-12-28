import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { useAddItem } from './useAddItem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const newItem = {
  title: "New Item",
  author: "Me",
  type: "Article",
  status: "In Progress",
  progress: "0%",
  startDate: "2025-01-01T00:00:00.000Z",
}

describe('useAddItem', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  test('posts new item', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => newItem,
    } as Response)

    const { result } = renderHook(() => useAddItem(), { wrapper })

    result.current.mutate(newItem as any)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    expect(global.fetch).toHaveBeenCalledWith('/api/learning-items', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newItem)
    }))
  })
})
