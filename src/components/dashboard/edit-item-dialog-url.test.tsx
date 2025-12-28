import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { EditItemDialog } from './edit-item-dialog'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateItem } from '@/hooks/useUpdateItem'
import { LearningItem } from '@/lib/schemas/learning-item'

vi.mock('@/hooks/useUpdateItem')

const mockItem: LearningItem = {
  id: "1",
  title: "Book",
  author: "Author",
  type: "Book",
  status: "In Progress",
  progress: "50%",
  startDate: "",
  lastUpdated: "",
  url: "https://initial.com"
}

test('updates item with new url', async () => {
  const mutate = vi.fn()
  vi.mocked(useUpdateItem).mockReturnValue({
    mutate,
    isPending: false,
  } as any)

  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <EditItemDialog item={mockItem} trigger={<button>Edit</button>} />
    </QueryClientProvider>
  )

  fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
  
  fireEvent.change(screen.getByLabelText(/URL/i), { target: { value: 'https://updated.com' } })
  
  fireEvent.click(screen.getByRole('button', { name: /Save/i }))

  await waitFor(() => expect(mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "1",
      updates: expect.objectContaining({ url: "https://updated.com" })
    }),
    expect.anything()
  ))
})
