import { z } from "zod"

export const LearningItemType = z.enum(["Book", "Course", "Article"])
export type LearningItemType = z.infer<typeof LearningItemType>

export const LearningItemStatus = z.enum(["In Progress", "Completed", "On Hold", "Archived"])
export type LearningItemStatus = z.infer<typeof LearningItemStatus>

export const LearningItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  type: LearningItemType,
  status: LearningItemStatus,
  progress: z.string().min(1, "Progress is required"),
  url: z.string().optional(),
  startDate: z.string().datetime(),
  lastUpdated: z.string().datetime(),
})

export type LearningItem = z.infer<typeof LearningItemSchema>
