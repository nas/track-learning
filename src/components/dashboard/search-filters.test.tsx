import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { SearchFilters } from './search-filters'

test('SearchFilters calls callback on input', () => {
  const onSearchChange = vi.fn()

  render(
    <SearchFilters 
      search="" 
      onSearchChange={onSearchChange} 
    />
  )

  fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'react' } })
  expect(onSearchChange).toHaveBeenCalledWith('react')
})
