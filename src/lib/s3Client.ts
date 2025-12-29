import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from '@aws-sdk/client-s3'
import { LearningItem } from './schemas/learning-item'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function getDataFromS3(
  bucket: string,
  key: string
): Promise<LearningItem[]> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  try {
    const response = await s3Client.send(command)
    const content = await response.Body!.transformToString()
    if (!content) {
      return []
    }
    return JSON.parse(content) as LearningItem[]
  } catch (error) {
    if (error instanceof NoSuchKey) {
      // File doesn't exist, which is a valid state (no items yet)
      return []
    }
    console.error('Error getting data from S3:', error)
    // Re-throw other errors
    throw error
  }
}

export async function putDataToS3(
  bucket: string,
  key: string,
  data: LearningItem[]
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  })

  try {
    await s3Client.send(command)
  } catch (error) {
    console.error('Error putting data to S3:', error)
    throw error
  }
}
