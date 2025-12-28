import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Page from './page'

test('renders dashboard heading', () => {
  render(<Page />)
  expect(screen.getByRole('heading', { name: /Learning Tracker/i })).toBeDefined()
})
