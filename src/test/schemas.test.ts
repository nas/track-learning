import { expect, test } from 'vitest'
import { LearningItemSchema } from '../lib/schemas/learning-item'

test('LearningItemSchema validates correct data', () => {
  const validData = {
    id: "1",
    title: "Book",
    author: "Author",
    type: "Book",
    status: "In Progress",
    progress: "50%",
    startDate: "2025-01-01T00:00:00Z",
    lastUpdated: "2025-01-01T00:00:00Z"
  }
  const result = LearningItemSchema.safeParse(validData)
  expect(result.success).toBe(true)
})

test('LearningItemSchema rejects invalid data', () => {
  const invalidData = {
    id: "1",
    title: "Book",
    // Missing fields
  }
  const result = LearningItemSchema.safeParse(invalidData)
  expect(result.success).toBe(false)
})
