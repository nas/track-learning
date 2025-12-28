import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Page from './page'

vi.mock('@/components/dashboard/dashboard-content', () => ({
  DashboardContent: () => <div data-testid="dashboard-content" />
}))

test('renders dashboard heading', () => {
  render(<Page />)
  expect(screen.getByRole('heading', { name: /Learning Tracker/i })).toBeDefined()
  expect(screen.getByTestId('dashboard-content')).toBeDefined()
})