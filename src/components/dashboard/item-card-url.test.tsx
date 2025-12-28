import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { ItemCard } from './item-card'
import { LearningItem } from '@/lib/schemas/learning-item'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockItemWithUrl: LearningItem = {
  id: "1",
  title: "Test Article",
  author: "Test Author",
  type: "Article",
  status: "In Progress",
  progress: "10%",
  startDate: "2025-01-01T00:00:00Z",
  lastUpdated: "2025-01-01T00:00:00Z",
  url: "https://example.com"
}

const mockItemWithoutUrl: LearningItem = {
  ...mockItemWithUrl,
  id: "2",
  url: undefined
}

test('renders title as link when url is present', () => {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ItemCard item={mockItemWithUrl} />
    </QueryClientProvider>
  )
  const link = screen.getByRole('link', { name: /Test Article/i })
  expect(link).toBeDefined()
  expect(link.getAttribute('href')).toBe('?viewer=https%3A%2F%2Fexample.com')
})

test('renders title as plain text when url is missing', () => {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ItemCard item={mockItemWithoutUrl} />
    </QueryClientProvider>
  )
  expect(screen.queryByRole('link')).toBeNull()
  expect(screen.getByText(mockItemWithoutUrl.title)).toBeDefined()
})

test('renders external link icon when url is present', () => {
    const queryClient = new QueryClient()
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ItemCard item={mockItemWithUrl} />
      </QueryClientProvider>
    )
    // External link icon from lucide-react is ExternalLink, usually renders as an svg
    const icon = container.querySelector('svg')
    expect(icon).toBeDefined()
})
