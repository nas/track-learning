import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { SearchFilters } from './search-filters'

test('SearchFilters calls callbacks on input', () => {
  const onSearchChange = vi.fn()
  const onTypeFilterChange = vi.fn()

  render(
    <SearchFilters 
      search="" 
      typeFilter="All" 
      onSearchChange={onSearchChange} 
      onTypeFilterChange={onTypeFilterChange} 
    />
  )

  fireEvent.change(screen.getByPlaceholderText(/Search/i), { target: { value: 'react' } })
  expect(onSearchChange).toHaveBeenCalledWith('react')

  fireEvent.change(screen.getByLabelText(/Filter by Type/i), { target: { value: 'Book' } })
  expect(onTypeFilterChange).toHaveBeenCalledWith('Book')
})
