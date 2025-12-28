import { expect, test } from 'vitest'
import { cn } from './utils'

test('cn merges classes correctly', () => {
  expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  expect(cn('p-4', { 'p-2': true })).toBe('p-2')
})
