import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { EditItemDialog } from './edit-item-dialog'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateItem } from '@/hooks/useUpdateItem'
import { useParseEditItem } from '@/hooks/useParseEditItem'
import { LearningItem } from '@/lib/schemas/learning-item'

vi.mock('@/hooks/useUpdateItem')
vi.mock('@/hooks/useParseEditItem')

const mockItem: LearningItem = {
  id: "1",
  title: "Book",
  author: "Author",
  type: "Book",
  status: "In Progress",
  progress: "50%",
  startDate: "2025-01-01T00:00:00.000Z",
  lastUpdated: "2025-01-01T00:00:00.000Z",
  url: "https://initial.com"
}

test('updates item with new url', async () => {
  const parseEdit = vi.fn().mockResolvedValue({ url: 'https://updated.com' })
  const updateItem = vi.fn()
  
  vi.mocked(useParseEditItem).mockReturnValue({
    mutateAsync: parseEdit,
    isPending: false,
  } as any)
  
  vi.mocked(useUpdateItem).mockReturnValue({
    mutate: updateItem,
    isPending: false,
  } as any)

  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <EditItemDialog item={mockItem} trigger={<button>Edit</button>} />
    </QueryClientProvider>
  )

  fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
  
  const input = screen.getByPlaceholderText(/update progress/i)
  fireEvent.change(input, { target: { value: 'update url to https://updated.com' } })
  fireEvent.click(screen.getByRole('button', { name: /Send/i }))

  await waitFor(() => expect(parseEdit).toHaveBeenCalled())
  await waitFor(() => expect(screen.getByRole('button', { name: /Confirm & Save/i })).toBeInTheDocument())
  
  fireEvent.click(screen.getByRole('button', { name: /Confirm & Save/i }))

  await waitFor(() => expect(updateItem).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "1",
      updates: expect.objectContaining({ url: "https://updated.com" })
    }),
    expect.anything()
  ))
})
