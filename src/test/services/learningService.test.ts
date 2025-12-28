import { expect, test, vi, beforeEach, describe } from 'vitest'
import { getLearningItems, addLearningItem, updateLearningItem } from '../../services/learningService'
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

const mockData = [
  {
    id: "1",
    title: "Book 1",
    author: "Author 1",
    type: "Book",
    status: "In Progress",
    progress: "50%",
    startDate: "2025-01-01T00:00:00Z",
    lastUpdated: "2025-01-01T00:00:00Z"
  }
]

describe('learningService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(path.resolve).mockReturnValue('/mock/data/learning-items.json')
  })

  test('getLearningItems reads and parses JSON', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData))
    
    const items = await getLearningItems()
    expect(items).toEqual(mockData)
    expect(fs.readFileSync).toHaveBeenCalledWith('/mock/data/learning-items.json', 'utf-8')
  })

  test('addLearningItem writes new item to file', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData))
    
    const newItem = {
      title: "New Course",
      author: "Author 2",
      type: "Course",
      status: "In Progress",
      progress: "0%",
      startDate: "2025-02-01T00:00:00Z",
      lastUpdated: "2025-02-01T00:00:00Z"
    }

    const addedItem = await addLearningItem(newItem as any)

    expect(addedItem.title).toBe(newItem.title)
    expect(addedItem.id).toBeDefined()
    expect(fs.writeFileSync).toHaveBeenCalled()
    
    // Verify content written
    const writtenData = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string)
    expect(writtenData.length).toBe(2)
    expect(writtenData[1].title).toBe("New Course")
  })
  
  test('updateLearningItem updates existing item', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData))

    const updates = {
        progress: "100%",
        status: "Completed"
    }

    const updatedItem = await updateLearningItem("1", updates as any)

    expect(updatedItem.progress).toBe("100%")
    expect(updatedItem.status).toBe("Completed")
    expect(fs.writeFileSync).toHaveBeenCalled()
    
    // Check update time
    expect(updatedItem.lastUpdated).not.toBe(mockData[0].lastUpdated)
  })

  test('getLearningItems returns empty array if file does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    const items = await getLearningItems()
    expect(items).toEqual([])
  })

  test('getLearningItems returns empty array on parse error', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue('invalid json')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const items = await getLearningItems()
    expect(items).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  test('updateLearningItem throws if item not found', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData))
    
    await expect(updateLearningItem("999", {})).rejects.toThrow("Item with id 999 not found")
  })
})
