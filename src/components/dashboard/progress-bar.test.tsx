import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressBar } from './progress-bar'

describe('ProgressBar', () => {
  it('renders with correct width', () => {
    const { container } = render(<ProgressBar progress="50%" />)
    const progressFill = container.querySelector('.progress-fill')
    expect(progressFill).toHaveStyle('width: 50%')
  })

  it('renders with 0% width if progress is invalid', () => {
    const { container } = render(<ProgressBar progress="invalid" />)
    const progressFill = container.querySelector('.progress-fill')
    expect(progressFill).toHaveStyle('width: 0%')
  })
})
