import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DashboardShell from './dashboard-shell'

describe('DashboardShell', () => {
  it('renders children correctly', () => {
    render(<DashboardShell><div>Child Content</div></DashboardShell>)
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('renders the header title', () => {
    render(<DashboardShell><div></div></DashboardShell>)
    expect(screen.getByText('Learning Tracker')).toBeInTheDocument()
  })
})
