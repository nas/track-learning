import fs from 'fs'
import path from 'path'
import {
  AddLearningItemInput,
  LearningItem,
  LearningItemSchema,
} from '../lib/schemas/learning-item'

const DATA_PATH = path.resolve(process.cwd(), 'data/learning-items.json')

export async function getLearningItems(): Promise<LearningItem[]> {
  if (!fs.existsSync(DATA_PATH)) {
    return []
  }
  const content = fs.readFileSync(DATA_PATH, 'utf-8')
  try {
    const data = JSON.parse(content)
    return data as LearningItem[]
  } catch (error) {
    console.error("Error parsing learning items:", error)
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
    lastUpdated: new Date().toISOString()
  }
  
  // Validate before saving
  const validatedItem = LearningItemSchema.parse(newItem)
  
  items.push(validatedItem)
  
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2))
  
  return validatedItem
}

export async function updateLearningItem(id: string, updates: Partial<LearningItem>): Promise<LearningItem> {
    const items = await getLearningItems()
    const index = items.findIndex(i => i.id === id)
    
    if (index === -1) {
        throw new Error(`Item with id ${id} not found`)
    }
    
    const updatedItem = {
        ...items[index],
        ...updates,
        lastUpdated: new Date().toISOString()
    }
    
    // Validate
    const validatedItem = LearningItemSchema.parse(updatedItem)
    
    items[index] = validatedItem
    
    fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2))
    
    return validatedItem
}
