import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi, describe } from 'vitest'
import { EditItemChat } from './edit-item-chat'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useParseEditItem } from '@/hooks/useParseEditItem'
import { useUpdateItem } from '@/hooks/useUpdateItem'
import { LearningItem } from '@/lib/schemas/learning-item'

vi.mock('@/hooks/useParseEditItem')
vi.mock('@/hooks/useUpdateItem')

const mockItem: LearningItem = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  type: 'Book',
  status: 'In Progress',
  progress: '50%',
  url: 'https://example.com',
  startDate: '2025-01-01T00:00:00.000Z',
  lastUpdated: '2025-01-01T00:00:00.000Z',
}

describe('EditItemChat', () => {
  const queryClient = new QueryClient()

  test('displays current item details in initial message', () => {
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
        <EditItemChat item={mockItem} />
      </QueryClientProvider>
    )

    expect(screen.getByText(/Test Book/i)).toBeInTheDocument()
    expect(screen.getByText(/Test Author/i)).toBeInTheDocument()
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument()
  })

  test('parses edit message and shows preview', async () => {
    const parseEdit = vi.fn().mockResolvedValue({ status: 'Completed', progress: '75%' })
    vi.mocked(useParseEditItem).mockReturnValue({
      mutateAsync: parseEdit,
      isPending: false,
    } as any)
    vi.mocked(useUpdateItem).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <EditItemChat item={mockItem} />
      </QueryClientProvider>
    )

    const input = screen.getByPlaceholderText(/update progress/i)
    fireEvent.change(input, { target: { value: 'update status to completed and progress to 75%' } })
    fireEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() => expect(parseEdit).toHaveBeenCalled())
    expect(screen.getByText(/Changes/i)).toBeInTheDocument()
  })

  test('handles archiving command', async () => {
    const parseEdit = vi.fn().mockResolvedValue({ status: 'Archived' })
    vi.mocked(useParseEditItem).mockReturnValue({
      mutateAsync: parseEdit,
      isPending: false,
    } as any)
    vi.mocked(useUpdateItem).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <EditItemChat item={mockItem} />
      </QueryClientProvider>
    )

    const input = screen.getByPlaceholderText(/update progress/i)
    fireEvent.change(input, { target: { value: 'archive this' } })
    fireEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() => expect(parseEdit).toHaveBeenCalled())
    expect(screen.getByText(/archiving/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confirm & Archive/i })).toBeInTheDocument()
  })

  test('handles archiving with other updates', async () => {
    const parseEdit = vi.fn().mockResolvedValue({ status: 'Archived', progress: '100%' })
    vi.mocked(useParseEditItem).mockReturnValue({
      mutateAsync: parseEdit,
      isPending: false,
    } as any)
    vi.mocked(useUpdateItem).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <EditItemChat item={mockItem} />
      </QueryClientProvider>
    )

    const input = screen.getByPlaceholderText(/update progress/i)
    fireEvent.change(input, { target: { value: 'archive and mark progress as complete' } })
    fireEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() => expect(parseEdit).toHaveBeenCalled())
    expect(screen.getByText(/archiving/i)).toBeInTheDocument()
  })

  test('confirms and saves updates', async () => {
    const parseEdit = vi.fn().mockResolvedValue({ progress: '75%' })
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
        <EditItemChat item={mockItem} />
      </QueryClientProvider>
    )

    const input = screen.getByPlaceholderText(/update progress/i)
    fireEvent.change(input, { target: { value: 'update progress to 75%' } })
    fireEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /Confirm & Save/i })).toBeInTheDocument())
    
    fireEvent.click(screen.getByRole('button', { name: /Confirm & Save/i }))

    await waitFor(() => expect(updateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        updates: { progress: '75%' },
      }),
      expect.anything()
    ))
  })

  test('handles parsing errors gracefully', async () => {
    const parseEdit = vi.fn().mockRejectedValue(new Error('Parsing failed'))
    vi.mocked(useParseEditItem).mockReturnValue({
      mutateAsync: parseEdit,
      isPending: false,
    } as any)
    vi.mocked(useUpdateItem).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <EditItemChat item={mockItem} />
      </QueryClientProvider>
    )

    const input = screen.getByPlaceholderText(/update progress/i)
    fireEvent.change(input, { target: { value: 'invalid message' } })
    fireEvent.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() => expect(screen.getByText(/trouble understanding/i)).toBeInTheDocument())
  })
})

