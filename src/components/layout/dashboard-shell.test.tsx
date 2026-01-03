import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardShell from './dashboard-shell'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/navigation'

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('DashboardShell', () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>)
  })

  it('renders children correctly', () => {
    render(
      <ThemeProvider attribute="class">
        <DashboardShell><div>Child Content</div></DashboardShell>
      </ThemeProvider>
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('renders the header title', () => {
    render(
      <ThemeProvider attribute="class">
        <DashboardShell><div></div></DashboardShell>
      </ThemeProvider>
    )
    expect(screen.getByText('Learning Tracker')).toBeInTheDocument()
  })
})
