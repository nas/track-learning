import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from '@aws-sdk/client-s3'
import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest'
import { getDataFromS3, putDataToS3 } from './s3Client'
import { LearningItem } from './schemas/learning-item'

vi.mock('@aws-sdk/client-s3')

const mockItems: LearningItem[] = [
  {
    id: '1',
    title: 'Test Item',
    author: 'Tester',
    type: 'Book',
    status: 'In Progress',
    progress: '10%',
    startDate: '2025-01-01T00:00:00.000Z',
    lastUpdated: '2025-01-01T00:00:00.000Z',
  },
]

describe('s3Client', () => {
  let s3ClientInstance: any

  beforeEach(() => {
    // Get the instance of the mocked S3Client. As s3Client.ts creates one
    // instance at the module level, it will be the first and only instance.
    s3ClientInstance = vi.mocked(S3Client).mock.instances[0]
    s3ClientInstance.send.mockReset()
    vi.mocked(GetObjectCommand).mockClear()
    vi.mocked(PutObjectCommand).mockClear()
  })

  afterEach(() => {
    // vi.clearAllMocks() was removed because it clears mock.instances, which
    // is not desirable when the instance is created only once at the module level.
  })

  describe('getDataFromS3', () => {
    test('should return parsed data when object exists', async () => {
      s3ClientInstance.send.mockResolvedValue({
        Body: {
          transformToString: vi
            .fn()
            .mockResolvedValue(JSON.stringify(mockItems)),
        },
      })

      const data = await getDataFromS3('test-bucket', 'test-key')
      expect(data).toEqual(mockItems)
      expect(s3ClientInstance.send).toHaveBeenCalledOnce()

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test-key',
      })
    })

    test('should return empty array if object does not exist (NoSuchKey)', async () => {
      const mockError = new Error('No Such Key')
      mockError.name = 'NoSuchKey'
      s3ClientInstance.send.mockRejectedValue(mockError)

      const data = await getDataFromS3('test-bucket', 'test-key')
      expect(data).toEqual([])
    })

    test('should re-throw other errors', async () => {
      const error = new Error('Some other S3 error')
      s3ClientInstance.send.mockRejectedValue(error)

      await expect(getDataFromS3('test-bucket', 'test-key')).rejects.toThrow(
        error
      )
    })
  })

  describe('putDataToS3', () => {
    test('should send PutObjectCommand with correct data', async () => {
      s3ClientInstance.send.mockResolvedValue({} as any)

      await putDataToS3('test-bucket', 'test-key', mockItems)

      expect(s3ClientInstance.send).toHaveBeenCalledOnce()
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test-key',
        Body: JSON.stringify(mockItems, null, 2),
        ContentType: 'application/json',
      })
    })

    test('should throw error if S3 send fails', async () => {
      const error = new Error('S3 put error')
      s3ClientInstance.send.mockRejectedValue(error)

      await expect(
        putDataToS3('test-bucket', 'test-key', mockItems)
      ).rejects.toThrow(error)
    })
  })
})
