import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { ItemCard } from './item-card'
import { LearningItem } from '@/lib/schemas/learning-item'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockItem: LearningItem = {
  id: "1",
  title: "Test Book",
  author: "Test Author",
  type: "Book",
  status: "In Progress",
  progress: "50%",
  startDate: "2025-01-01T00:00:00Z",
  lastUpdated: "2025-01-01T00:00:00Z"
}

test('renders ItemCard with item details', () => {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ItemCard item={mockItem} />
    </QueryClientProvider>
  )
  expect(screen.getByText(mockItem.title)).toBeDefined()
  expect(screen.getByText(mockItem.author)).toBeDefined()
  expect(screen.getByText(mockItem.progress)).toBeDefined()
})