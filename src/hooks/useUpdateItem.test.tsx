import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { useUpdateItem } from './useUpdateItem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

describe('useUpdateItem', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  test('updates item', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", title: "Updated" }),
    } as Response)

    const { result } = renderHook(() => useUpdateItem(), { wrapper })

    result.current.mutate({ id: "1", updates: { title: "Updated" } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    expect(global.fetch).toHaveBeenCalledWith('/api/learning-items', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ id: "1", updates: { title: "Updated" } })
    }))
  })
})
