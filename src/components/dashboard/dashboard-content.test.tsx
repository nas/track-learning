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

test('DashboardContent displays Archived items at the end', async () => {
  const itemsWithArchived = [
    { id: "1", title: "Archived Item", author: "Author", type: "Book", status: "Archived", progress: "100%", startDate: "2025-01-01T00:00:00Z", lastUpdated: "2025-01-01T00:00:00Z" },
    { id: "2", title: "In Progress Item", author: "Author", type: "Book", status: "In Progress", progress: "50%", startDate: "2025-01-01T00:00:00Z", lastUpdated: "2025-01-01T00:00:00Z" },
    { id: "3", title: "Completed Item", author: "Author", type: "Book", status: "Completed", progress: "100%", startDate: "2025-01-01T00:00:00Z", lastUpdated: "2025-01-01T00:00:00Z" },
  ]

  vi.mocked(useLearningItems).mockReturnValue({
    data: itemsWithArchived,
    isLoading: false,
    isError: false,
  } as any)

  const queryClient = new QueryClient()
  const { container } = render(
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  )

  const itemCards = container.querySelectorAll('[aria-label="learning-items-grid"] > div')
  const itemTitles = Array.from(itemCards).map(card => card.textContent)
  
  // Archived item should be last
  expect(itemTitles[itemTitles.length - 1]).toContain("Archived Item")
})
