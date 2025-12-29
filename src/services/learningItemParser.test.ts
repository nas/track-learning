import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest'
import { parseLearningItemFromMessage, parseEditItemFromMessage } from './learningItemParser'

describe('learningItemParser', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.LLM_PROVIDER = 'ollama'
    process.env.LLM_BASE_URL = 'http://localhost:11434'
    process.env.LLM_MODEL = 'llama3.1:8b'
  })

  afterEach(() => {
    process.env = originalEnv
    vi.resetAllMocks()
  })

  test('parses and normalizes learning item data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          content:
            '{"title":"The Pragmatic Programmer","author":"Andy Hunt","type":"Book","progress":"15%"}',
        },
      }),
    } as Response)

    const item = await parseLearningItemFromMessage('sample message')

    expect(item.title).toBe('The Pragmatic Programmer')
    expect(item.author).toBe('Andy Hunt')
    expect(item.type).toBe('Book')
    expect(item.status).toBe('In Progress')
    expect(item.progress).toBe('15%')
    expect(item.startDate).toBeDefined()
  })

  describe('parseEditItemFromMessage', () => {
    const currentItem = {
      title: 'Test Book',
      author: 'Test Author',
      type: 'Book',
      status: 'In Progress',
      progress: '50%',
      url: 'https://example.com',
    }

    test('parses status update', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: '{"status":"Completed"}',
          },
        }),
      } as Response)

      const updates = await parseEditItemFromMessage('mark as completed', currentItem)

      expect(updates.status).toBe('Completed')
      expect(updates.progress).toBeUndefined()
      expect(updates.url).toBeUndefined()
    })

    test('parses progress update', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: '{"progress":"75%"}',
          },
        }),
      } as Response)

      const updates = await parseEditItemFromMessage('update progress to 75%', currentItem)

      expect(updates.progress).toBe('75%')
      expect(updates.status).toBeUndefined()
    })

    test('parses archiving command', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: '{"status":"Archived"}',
          },
        }),
      } as Response)

      const updates = await parseEditItemFromMessage('archive this', currentItem)

      expect(updates.status).toBe('Archived')
    })

    test('parses archiving with other updates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: '{"status":"Archived","progress":"100%"}',
          },
        }),
      } as Response)

      const updates = await parseEditItemFromMessage('archive and mark progress as complete', currentItem)

      expect(updates.status).toBe('Archived')
      expect(updates.progress).toBe('100%')
    })

    test('parses multiple field updates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: '{"status":"Completed","progress":"100%","url":"https://newurl.com"}',
          },
        }),
      } as Response)

      const updates = await parseEditItemFromMessage('set status to completed, progress to 100%, and update url', currentItem)

      expect(updates.status).toBe('Completed')
      expect(updates.progress).toBe('100%')
      expect(updates.url).toBe('https://newurl.com')
    })

    test('throws error when no fields are updated', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: '{}',
          },
        }),
      } as Response)

      await expect(parseEditItemFromMessage('nothing', currentItem)).rejects.toThrow('No fields to update')
    })
  })
})
