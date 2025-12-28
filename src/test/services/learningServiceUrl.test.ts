import { expect, test, vi, beforeEach, describe } from 'vitest'
import { addLearningItem, updateLearningItem, getLearningItems } from '../../services/learningService'
import fs from 'fs'
import path from 'path'

// Explicitly mock fs
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
  },
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
}))

vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal<typeof import('path')>()
  return {
    ...actual,
    default: {
      ...actual,
      resolve: vi.fn(() => '/mock/data/learning-items.json'),
    },
    resolve: vi.fn(() => '/mock/data/learning-items.json'),
  }
})

describe('learningService with URL', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(path.resolve).mockReturnValue('/mock/data/learning-items.json')
  })

  test('addLearningItem saves url if provided', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify([]))
    
    const newItem = {
      title: "New Course",
      author: "Author 2",
      type: "Course",
      status: "In Progress",
      progress: "0%",
      startDate: new Date().toISOString(),
      url: "https://example.com"
    }

    const addedItem = await addLearningItem(newItem as any)

    expect(addedItem.url).toBe("https://example.com")
    
    // Verify content written to file
    const writtenData = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string)
    expect(writtenData[0].url).toBe("https://example.com")
  })

  test('updateLearningItem updates url', async () => {
    const existingData = [
      {
        id: "1",
        title: "Book 1",
        author: "Author 1",
        type: "Book",
        status: "In Progress",
        progress: "50%",
        startDate: "2025-01-01T00:00:00Z",
        lastUpdated: "2025-01-01T00:00:00Z",
        url: "https://old.com"
      }
    ]
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingData))

    const updates = {
        url: "https://new.com"
    }

    const updatedItem = await updateLearningItem("1", updates as any)

    expect(updatedItem.url).toBe("https://new.com")
    
    const writtenData = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string)
    expect(writtenData[0].url).toBe("https://new.com")
  })
})
