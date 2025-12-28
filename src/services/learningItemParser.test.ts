import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest'
import { parseLearningItemFromMessage } from './learningItemParser'

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
})
