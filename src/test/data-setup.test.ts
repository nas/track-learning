import { expect, test } from 'vitest'
import fs from 'fs'
import path from 'path'

test('learning-items.json exists and is valid JSON', () => {
  const dataPath = path.resolve(process.cwd(), 'data/learning-items.json')
  expect(fs.existsSync(dataPath)).toBe(true)
  
  const content = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(content)
  expect(Array.isArray(data)).toBe(true)
  expect(data.length).toBeGreaterThan(0)
})
