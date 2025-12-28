import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AnimatedBackground } from './animated-background'

describe('AnimatedBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<AnimatedBackground />)
    expect(container).toBeInTheDocument()
  })

  it('contains the gradient element', () => {
    const { container } = render(<AnimatedBackground />)
    // We expect a div that will hold the gradient background
    const gradientDiv = container.firstChild
    expect(gradientDiv).toHaveClass('fixed')
    expect(gradientDiv).toHaveClass('inset-0')
    expect(gradientDiv).toHaveClass('z-[-1]')
  })
})
