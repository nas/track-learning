import { expect, test, describe } from 'vitest'
import { applySearchCriteria } from './searchUtils'
import { LearningItem } from './schemas/learning-item'
import { SearchCriteria } from '@/hooks/useParseSearch'

const mockItems: LearningItem[] = [
  {
    id: '1',
    title: 'The Pragmatic Programmer',
    author: 'Andy Hunt',
    type: 'Book',
    status: 'In Progress',
    progress: '50%',
    startDate: '2025-01-01T00:00:00.000Z',
    lastUpdated: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'React Course',
    author: 'John Doe',
    type: 'Course',
    status: 'Completed',
    progress: '100%',
    startDate: '2025-01-01T00:00:00.000Z',
    lastUpdated: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'TypeScript Article',
    author: 'Jane Smith',
    type: 'Article',
    status: 'Archived',
    progress: '75%',
    startDate: '2025-01-01T00:00:00.000Z',
    lastUpdated: '2025-01-01T00:00:00.000Z',
  },
]

describe('applySearchCriteria', () => {
  test('filters by search text in title', () => {
    const criteria: SearchCriteria = { searchText: 'pragmatic' }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('The Pragmatic Programmer')
  })

  test('filters by search text in author', () => {
    const criteria: SearchCriteria = { searchText: 'andy' }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(1)
    expect(result[0].author).toBe('Andy Hunt')
  })

  test('filters by type', () => {
    const criteria: SearchCriteria = { type: 'Book' }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('Book')
  })

  test('filters by status', () => {
    const criteria: SearchCriteria = { status: 'Completed' }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('Completed')
  })

  test('filters by minimum progress', () => {
    const criteria: SearchCriteria = { progressMin: '75%' }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(2)
    // Items with 75% and 100% progress should match
    expect(result.map(item => item.progress)).toContain('75%')
    expect(result.map(item => item.progress)).toContain('100%')
  })

  test('filters by maximum progress', () => {
    const criteria: SearchCriteria = { progressMax: '60%' }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(1)
    expect(result[0].progress).toBe('50%')
  })

  test('filters by combined criteria', () => {
    const criteria: SearchCriteria = {
      searchText: 'pragmatic',
      type: 'Book',
      status: 'In Progress',
    }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('The Pragmatic Programmer')
  })

  test('filters by excluded status', () => {
    const criteria: SearchCriteria = { excludeStatus: 'Archived' }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(2)
    expect(result.every(item => item.status !== 'Archived')).toBe(true)
  })

  test('filters by excluded status with other criteria', () => {
    const criteria: SearchCriteria = {
      excludeStatus: 'Archived',
      type: 'Book',
    }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('Book')
    expect(result[0].status).not.toBe('Archived')
  })

  test('filters by excluded type', () => {
    const criteria: SearchCriteria = { excludeType: 'Book' }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(2)
    expect(result.every(item => item.type !== 'Book')).toBe(true)
  })

  test('filters by excluded type with other criteria', () => {
    const criteria: SearchCriteria = {
      excludeType: 'Book',
      status: 'In Progress',
    }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(0) // The only "In Progress" item is a Book, so it's excluded
  })

  test('filters by excluded type and excluded status', () => {
    const criteria: SearchCriteria = {
      excludeType: 'Book',
      excludeStatus: 'Archived',
    }
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('Course')
    expect(result[0].status).toBe('Completed')
  })

  test('returns all items when no criteria', () => {
    const criteria: SearchCriteria = {}
    const result = applySearchCriteria(mockItems, criteria)
    expect(result).toHaveLength(3)
  })
})

