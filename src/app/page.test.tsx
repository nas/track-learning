import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Page from './page'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/navigation'

vi.mock('@/components/dashboard/dashboard-content', () => ({
  DashboardContent: () => <div data-testid="dashboard-content" />
}))

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

test('renders dashboard heading', async () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()

  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>)

  const page = await Page({ searchParams: Promise.resolve({}) })
  render(
    <ThemeProvider attribute="class">
      {page}
    </ThemeProvider>
  )
  expect(screen.getByRole('heading', { name: /Dashboard/i })).toBeDefined()
  expect(screen.getByText('Learning Tracker')).toBeInTheDocument()
  expect(screen.getByTestId('dashboard-content')).toBeDefined()
})