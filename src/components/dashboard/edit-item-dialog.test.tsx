import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { EditItemDialog } from './edit-item-dialog'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useParseEditItem } from '@/hooks/useParseEditItem'
import { useUpdateItem } from '@/hooks/useUpdateItem'
import { LearningItem } from '@/lib/schemas/learning-item'

vi.mock('@/hooks/useParseEditItem')
vi.mock('@/hooks/useUpdateItem')

const mockItem: LearningItem = {
  id: "1",
  title: "Book",
  author: "Author",
  type: "Book",
  status: "In Progress",
  progress: "50%",
  url: "https://example.com",
  startDate: "2025-01-01T00:00:00.000Z",
  lastUpdated: "2025-01-01T00:00:00.000Z"
}

describe('EditItemDialog', () => {
  const queryClient = new QueryClient()

  test('opens dialog and shows chat interface', () => {
    vi.mocked(useParseEditItem).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useUpdateItem).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <EditItemDialog item={mockItem} trigger={<button>Edit</button>} />
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
    
    expect(screen.getByText(/Edit Learning Item/i)).toBeInTheDocument()
    expect(screen.getByText(/Book/i)).toBeInTheDocument()
    expect(screen.getByText(/Author/i)).toBeInTheDocument()
  })

  test('allows archiving through chat interface', async () => {
    const parseEdit = vi.fn().mockResolvedValue({ status: 'Archived' })
    const updateItem = vi.fn()
    vi.mocked(useParseEditItem).mockReturnValue({
      mutateAsync: parseEdit,
      isPending: false,
    } as any)
    vi.mocked(useUpdateItem).mockReturnValue({
      mutate: updateItem,
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <EditItemDialog item={mockItem} trigger={<button>Edit</button>} />
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
    
    const input = screen.getByPlaceholderText(/update progress/i)
    fireEvent.change(input, { target: { value: 'archive this' } })
    fireEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() => expect(parseEdit).toHaveBeenCalled())
    expect(screen.getByText(/archiving/i)).toBeInTheDocument()
    
    fireEvent.click(screen.getByRole('button', { name: /Confirm & Archive/i }))

    await waitFor(() => expect(updateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "1",
        updates: expect.objectContaining({ status: "Archived" })
      }),
      expect.anything()
    ))
  })
})