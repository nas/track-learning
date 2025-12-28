import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { DashboardContent } from './dashboard-content'
import { useLearningItems } from '@/hooks/useLearningItems'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

vi.mock('@/hooks/useLearningItems')

const mockItems = [
  { id: "1", title: "Test Item", author: "Author", type: "Book", status: "In Progress", progress: "10%", startDate: "2025-01-01T00:00:00Z", lastUpdated: "2025-01-01T00:00:00Z" }
]

test('DashboardContent renders items from hook', async () => {
  vi.mocked(useLearningItems).mockReturnValue({
    data: mockItems,
    isLoading: false,
    isError: false,
  } as any)

  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  )

  expect(screen.getByText("Test Item")).toBeDefined()
})
