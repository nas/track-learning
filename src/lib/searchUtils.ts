import { LearningItem } from './schemas/learning-item'
import { SearchCriteria } from '@/hooks/useParseSearch'

function extractProgressNumber(progress: string): number {
  const match = progress.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function matchesProgress(progress: string, min?: string, max?: string): boolean {
  const progressNum = extractProgressNumber(progress)
  
  if (min !== undefined) {
    const minNum = extractProgressNumber(min)
    if (progressNum < minNum) return false
  }
  
  if (max !== undefined) {
    const maxNum = extractProgressNumber(max)
    if (progressNum > maxNum) return false
  }
  
  return true
}

export function applySearchCriteria(
  items: LearningItem[],
  criteria: SearchCriteria
): LearningItem[] {
  return items.filter((item) => {
    // Search text matching
    if (criteria.searchText) {
      const searchLower = criteria.searchText.toLowerCase()
      const matchesTitle = item.title.toLowerCase().includes(searchLower)
      const matchesAuthor = item.author.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesAuthor) {
        return false
      }
    }

    // Type filter
    if (criteria.type && item.type !== criteria.type) {
      return false
    }

    // Status filter
    if (criteria.status && item.status !== criteria.status) {
      return false
    }

    // Progress filters
    if (criteria.progressMin || criteria.progressMax) {
      if (!matchesProgress(item.progress, criteria.progressMin, criteria.progressMax)) {
        return false
      }
    }

    return true
  })
}

