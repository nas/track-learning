import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { AddItemForm } from './add-item-form'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAddItem } from '@/hooks/useAddItem'

vi.mock('@/hooks/useAddItem')

test('submits form with url', async () => {
  const mutate = vi.fn()
  vi.mocked(useAddItem).mockReturnValue({
    mutate,
    isPending: false,
  } as any)

  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <AddItemForm />
    </QueryClientProvider>
  )

  fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Book' } })
  fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'Author' } })
  fireEvent.change(screen.getByLabelText(/URL/i), { target: { value: 'https://example.com' } })
  
  fireEvent.click(screen.getByRole('button', { name: /Add Item/i }))

  await waitFor(() => expect(mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      url: 'https://example.com'
    }),
    expect.anything()
  ))
})
