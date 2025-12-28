import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders with default text when no props are provided', () => {
    render(<EmptyState />)
    expect(screen.getByText(/No learning items found/i)).toBeInTheDocument()
    expect(screen.getByText(/Time to start a new adventure!/i)).toBeInTheDocument()
  })

  it('renders custom title and message', () => {
    render(<EmptyState title="Custom Title" message="Custom Message" />)
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom Message')).toBeInTheDocument()
  })

  it('renders action button if provided', () => {
    render(<EmptyState action={<button>Add Now</button>} />)
    expect(screen.getByText('Add Now')).toBeInTheDocument()
  })
})
