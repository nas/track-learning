import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { LearningItem } from './schemas/learning-item'

// S3 client configuration
// In Lambda, IAM role credentials are automatically provided by the runtime
// For local dev, use access key and secret from environment variables
// Lambda sets AWS_ACCESS_KEY_ID automatically, but we should use IAM role instead
const isLambda = !!(
  process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
)

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-2',
  // Only use explicit credentials for local development (not in Lambda)
  // In Lambda, the SDK will automatically use the IAM role credentials
  ...(!isLambda &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
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
    if ((error as Error).name === 'NoSuchKey') {
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
