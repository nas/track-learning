import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi, describe, beforeEach } from 'vitest'
import LoginPage from './page'
import { useRouter } from 'next/navigation'

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('LoginPage', () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>)
    
    // Mock global fetch
    global.fetch = vi.fn()
  })

  test('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeDefined()
    expect(screen.getByLabelText(/Password/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Access Dashboard/i })).toBeDefined()
  })

  test('handles successful login', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText(/Password/i)
    fireEvent.change(passwordInput, { target: { value: 'secret' } })
    
    const submitButton = screen.getByRole('button', { name: /Access Dashboard/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'secret' }),
      })
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  test('handles failed login', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid password' }),
    } as Response)

    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText(/Password/i)
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })
    
    const submitButton = screen.getByRole('button', { name: /Access Dashboard/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeDefined()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
