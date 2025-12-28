import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { ThemeToggle } from './theme-toggle'
import { ThemeProvider } from 'next-themes'
import React from 'react'

test('ThemeToggle renders toggle button', () => {
  render(
    <ThemeProvider attribute="class">
      <ThemeToggle />
    </ThemeProvider>
  )

  expect(screen.getByRole('button', { name: /Toggle Theme/i })).toBeDefined()
})
