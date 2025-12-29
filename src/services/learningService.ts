import { getDataFromS3, putDataToS3 } from '../lib/s3Client'
import {
  AddLearningItemInput,
  LearningItem,
  LearningItemSchema,
} from '../lib/schemas/learning-item'

const S3_BUCKET = process.env.S3_BUCKET_NAME!
const S3_KEY = process.env.S3_DATA_KEY || 'learning-items.json'

export async function getLearningItems(): Promise<LearningItem[]> {
  try {
    const items = await getDataFromS3(S3_BUCKET, S3_KEY)
    return items
  } catch (error) {
    console.error('Failed to get learning items from S3:', error)
    // Return empty array on failure to prevent app crash
    return []
  }
}

export async function addLearningItem(
  item: AddLearningItemInput
): Promise<LearningItem> {
  const items = await getLearningItems()

  const newItem: LearningItem = {
    ...item,
    id: crypto.randomUUID(),
    lastUpdated: new Date().toISOString(),
  }

  // Validate before saving
  const validatedItem = LearningItemSchema.parse(newItem)

  items.push(validatedItem)

  await putDataToS3(S3_BUCKET, S3_KEY, items)

  return validatedItem
}

export async function updateLearningItem(
  id: string,
  updates: Partial<LearningItem>
): Promise<LearningItem> {
  const items = await getLearningItems()
  const index = items.findIndex(i => i.id === id)

  if (index === -1) {
    throw new Error(`Item with id ${id} not found`)
  }

  const updatedItem = {
    ...items[index],
    ...updates,
    lastUpdated: new Date().toISOString(),
  }

  // Validate
  const validatedItem = LearningItemSchema.parse(updatedItem)

  items[index] = validatedItem

  await putDataToS3(S3_BUCKET, S3_KEY, items)

  return validatedItem
}
