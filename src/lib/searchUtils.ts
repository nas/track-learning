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

    // Type filter (include) - supports single value or array (OR logic)
    if (criteria.type) {
      if (Array.isArray(criteria.type)) {
        if (!criteria.type.includes(item.type)) {
          return false
        }
      } else {
        if (item.type !== criteria.type) {
          return false
        }
      }
    }

    // Type filter (exclude) - supports single value or array (exclude if in array)
    if (criteria.excludeType) {
      if (Array.isArray(criteria.excludeType)) {
        if (criteria.excludeType.includes(item.type)) {
          return false
        }
      } else {
        if (item.type === criteria.excludeType) {
          return false
        }
      }
    }

    // Status filter (include) - supports single value or array (OR logic)
    if (criteria.status) {
      if (Array.isArray(criteria.status)) {
        if (!criteria.status.includes(item.status)) {
          return false
        }
      } else {
        if (item.status !== criteria.status) {
          return false
        }
      }
    }

    // Status filter (exclude) - supports single value or array (exclude if in array)
    if (criteria.excludeStatus) {
      if (Array.isArray(criteria.excludeStatus)) {
        if (criteria.excludeStatus.includes(item.status)) {
          return false
        }
      } else {
        if (item.status === criteria.excludeStatus) {
          return false
        }
      }
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

