import { expect, test, vi, beforeEach, describe } from 'vitest'
import { addLearningItem, updateLearningItem } from '../../services/learningService'
import { getDataFromS3, putDataToS3 } from '../../lib/s3Client'

vi.mock('../../lib/s3Client')

describe('learningService with URL', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('addLearningItem saves url if provided', async () => {
    vi.mocked(getDataFromS3).mockResolvedValue([])
    
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
    
    // Verify content written to S3
    const writtenData = vi.mocked(putDataToS3).mock.calls[0][2] as any[]
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
    vi.mocked(getDataFromS3).mockResolvedValue(existingData)

    const updates = {
        url: "https://new.com"
    }

    const updatedItem = await updateLearningItem("1", updates as any)

    expect(updatedItem.url).toBe("https://new.com")
    
    const writtenData = vi.mocked(putDataToS3).mock.calls[0][2] as any[]
    expect(writtenData[0].url).toBe("https://new.com")
  })
})
