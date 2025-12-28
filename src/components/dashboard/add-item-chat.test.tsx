import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { AddItemChat } from './add-item-chat'
import { useAddItem } from '@/hooks/useAddItem'
import { useParseItem } from '@/hooks/useParseItem'

vi.mock('@/hooks/useAddItem')
vi.mock('@/hooks/useParseItem')

test('parses message and confirms add', async () => {
  const mutate = vi.fn()
  const mutateAsync = vi.fn().mockResolvedValue({
    title: 'New Book',
    author: 'Author',
    type: 'Book',
    status: 'In Progress',
    progress: '10%',
    startDate: '2025-01-01T00:00:00.000Z',
  })

  vi.mocked(useAddItem).mockReturnValue({
    mutate,
    isPending: false,
  } as any)

  vi.mocked(useParseItem).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as any)

  render(<AddItemChat />)

  fireEvent.change(screen.getByLabelText(/Your message/i), {
    target: { value: 'New Book by Author, 10%' },
  })

  fireEvent.click(screen.getByRole('button', { name: /Send/i }))

  await waitFor(() => expect(mutateAsync).toHaveBeenCalled())

  fireEvent.click(screen.getByRole('button', { name: /Confirm & Add/i }))

  expect(mutate).toHaveBeenCalled()
})
