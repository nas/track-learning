import { expect, test, vi, beforeEach, describe } from 'vitest'
import { getLearningItems, addLearningItem, updateLearningItem } from '../../services/learningService'
import { getDataFromS3, putDataToS3 } from '../../lib/s3Client'

vi.mock('../../lib/s3Client')

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
  })

  test('getLearningItems reads from S3', async () => {
    vi.mocked(getDataFromS3).mockResolvedValue(mockData)
    
    const items = await getLearningItems()
    expect(items).toEqual(mockData)
    expect(getDataFromS3).toHaveBeenCalled()
  })

  test('addLearningItem writes new item to S3', async () => {
    vi.mocked(getDataFromS3).mockResolvedValue(JSON.parse(JSON.stringify(mockData)))
    
    const newItem = {
      title: "New Course",
      author: "Author 2",
      type: "Course",
      status: "In Progress",
      progress: "0%",
      startDate: "2025-02-01T00:00:00Z",
    }

    const addedItem = await addLearningItem(newItem as any)

    expect(addedItem.title).toBe(newItem.title)
    expect(addedItem.id).toBeDefined()
    expect(putDataToS3).toHaveBeenCalled()
    
    // Verify content written
    const writtenData = vi.mocked(putDataToS3).mock.calls[0][2] as any[]
    expect(writtenData.length).toBe(2)
    expect(writtenData[1].title).toBe("New Course")
  })
  
  test('updateLearningItem updates existing item in S3', async () => {
    vi.mocked(getDataFromS3).mockResolvedValue(JSON.parse(JSON.stringify(mockData)))

    const updates = {
        progress: "100%",
        status: "Completed"
    }

    const updatedItem = await updateLearningItem("1", updates as any)

    expect(updatedItem.progress).toBe("100%")
    expect(updatedItem.status).toBe("Completed")
    expect(putDataToS3).toHaveBeenCalled()
    
    // Check update time
    expect(updatedItem.lastUpdated).not.toBe(mockData[0].lastUpdated)
  })

  test('getLearningItems returns empty array if data source is empty', async () => {
    vi.mocked(getDataFromS3).mockResolvedValue([])
    const items = await getLearningItems()
    expect(items).toEqual([])
  })

  test('getLearningItems returns empty array on fetch error', async () => {
    vi.mocked(getDataFromS3).mockRejectedValue(new Error('S3 fetch failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const items = await getLearningItems()
    expect(items).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  test('updateLearningItem throws if item not found', async () => {
    vi.mocked(getDataFromS3).mockResolvedValue(mockData)
    
    await expect(updateLearningItem("999", {})).rejects.toThrow("Item with id 999 not found")
  })
})
