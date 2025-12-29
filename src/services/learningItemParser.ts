import { z } from 'zod'
import {
  AddLearningItemSchema,
  LearningItemStatus,
  LearningItemType,
} from '@/lib/schemas/learning-item'

const PartialLearningItemSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  website: z.string().optional(),
  type: LearningItemType.optional(),
  status: LearningItemStatus.optional(),
  progress: z.string().optional(),
  url: z.string().optional(),
  startDate: z.string().datetime().optional(),
})

type PartialLearningItem = z.infer<typeof PartialLearningItemSchema>

type ProviderConfig = {
  provider: 'ollama' | 'deepseek'
  baseUrl: string
  model: string
  apiKey?: string
}

function getProviderConfig(): ProviderConfig {
  const provider = (process.env.LLM_PROVIDER ?? 'ollama').toLowerCase()
  if (provider !== 'ollama' && provider !== 'deepseek') {
    throw new Error(`Unsupported LLM provider: ${provider}`)
  }

  if (provider === 'ollama') {
    return {
      provider,
      baseUrl: process.env.LLM_BASE_URL ?? 'http://localhost:11434',
      model: process.env.LLM_MODEL ?? 'llama3.1:8b',
    }
  }

  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) {
    throw new Error('Missing LLM_API_KEY for DeepSeek')
  }

  return {
    provider,
    baseUrl: process.env.LLM_BASE_URL ?? 'https://api.deepseek.com',
    model: process.env.LLM_MODEL ?? 'deepseek-chat',
    apiKey,
  }
}

function buildSystemPrompt(nowIso: string) {
  return [
    'You extract a learning item from a user message.',
    'Return ONLY a JSON object with these keys:',
    'title, author or website, type, status, progress, url, startDate.',
    'Use enums: type in ["Book","Course","Article"], status in ["In Progress","Completed","On Hold","Archived"].',
    'Progress is a percentage or a string like "0%" or "100%".',
    'Response may include an author or website name. If both are provided, use the author.',
    'If a field is missing, omit it or use a sensible default.',
    `Use ISO 8601 for startDate. If not provided, use ${nowIso}.`,
  ].join(' ')
}

function extractJson(text: string) {
  const trimmed = text.trim()
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const raw = fencedMatch ? fencedMatch[1] : trimmed
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('LLM response did not include JSON')
  }
  return JSON.parse(jsonMatch[0]) as unknown
}

function normalizeParsedItem(parsed: PartialLearningItem, nowIso: string) {
  console.log('parsed', parsed)
  const normalized = {
    title: parsed.title?.trim() ?? '',
    author: parsed.author?.trim() || parsed.website?.trim() || 'Unknown',
    type: parsed.type ?? 'Book',
    status: parsed.status ?? 'In Progress',
    progress: parsed.progress?.trim() || '0%',
    url: parsed.url?.trim() || undefined,
    startDate: parsed.startDate ?? nowIso,
  }

  if (!normalized.title) {
    throw new Error('Missing title in parsed response')
  }

  return AddLearningItemSchema.parse(normalized)
}

async function callProvider(
  config: ProviderConfig,
  message: string,
  nowIso: string
) {
  const systemPrompt = buildSystemPrompt(nowIso)
  const payload = {
    model: config.model,
    stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  }

  const url =
    config.provider === 'ollama'
      ? `${config.baseUrl}/api/chat`
      : `${config.baseUrl}/v1/chat/completions`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (config.provider === 'deepseek' && config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`LLM request failed (${response.status})`)
  }

  return response.json() as Promise<any>
}

function extractContent(provider: ProviderConfig['provider'], data: any) {
  if (provider === 'ollama') {
    return data?.message?.content ?? ''
  }

  return data?.choices?.[0]?.message?.content ?? ''
}

export async function parseLearningItemFromMessage(message: string) {
  const nowIso = new Date().toISOString()
  const config = getProviderConfig()
  const data = await callProvider(config, message, nowIso)
  const content = extractContent(config.provider, data)
  console.log('content', content)
  const parsed = PartialLearningItemSchema.parse(extractJson(content))
  return normalizeParsedItem(parsed, nowIso)
}

const EditItemUpdateSchema = z.object({
  status: LearningItemStatus.optional(),
  progress: z.string().optional(),
  url: z.string().optional(),
})

type EditItemUpdate = z.infer<typeof EditItemUpdateSchema>

function buildEditSystemPrompt(currentItem: {
  title: string
  author: string
  type: string
  status: string
  progress: string
  url?: string
}) {
  const itemContext = [
    `Current item: "${currentItem.title}" by ${currentItem.author}`,
    `Type: ${currentItem.type}`,
    `Current status: ${currentItem.status}`,
    `Current progress: ${currentItem.progress}`,
  ]
  if (currentItem.url) {
    itemContext.push(`Current URL: ${currentItem.url}`)
  }

  return [
    'You extract updates to a learning item from a user message.',
    'Return ONLY a JSON object with these optional keys: status, progress, url.',
    'Only include fields that the user wants to change.',
    '',
    ...itemContext,
    '',
    'Rules:',
    '- status must be one of: "In Progress", "Completed", "On Hold", "Archived"',
    '- If user mentions "archive", "archive this", "mark as archived", "archive it", or "set status to archived", always set status to "Archived"',
    '- If archiving is mentioned, set status to "Archived" even if other status values are mentioned',
    '- progress can be any string (e.g., "50%", "Chapter 5", "75%")',
    '- url should be a valid URL string or omitted',
    '- At least one field must be updated',
  ].join('\n')
}

function normalizeEditUpdate(parsed: EditItemUpdate) {
  const normalized: EditItemUpdate = {}

  if (parsed.status !== undefined) {
    normalized.status = parsed.status
  }
  if (parsed.progress !== undefined) {
    normalized.progress = parsed.progress.trim()
  }
  if (parsed.url !== undefined) {
    const trimmed = parsed.url.trim()
    normalized.url = trimmed || undefined
  }

  // Validate at least one field is being updated
  if (Object.keys(normalized).length === 0) {
    throw new Error('No fields to update')
  }

  return normalized
}

async function callProviderForEdit(
  config: ProviderConfig,
  message: string,
  currentItem: {
    title: string
    author: string
    type: string
    status: string
    progress: string
    url?: string
  }
) {
  const systemPrompt = buildEditSystemPrompt(currentItem)
  const payload = {
    model: config.model,
    stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  }

  const url =
    config.provider === 'ollama'
      ? `${config.baseUrl}/api/chat`
      : `${config.baseUrl}/v1/chat/completions`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (config.provider === 'deepseek' && config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`LLM request failed (${response.status})`)
  }

  return response.json() as Promise<any>
}

export async function parseEditItemFromMessage(
  message: string,
  currentItem: {
    title: string
    author: string
    type: string
    status: string
    progress: string
    url?: string
  }
) {
  const config = getProviderConfig()
  const data = await callProviderForEdit(config, message, currentItem)
  const content = extractContent(config.provider, data)
  const parsed = EditItemUpdateSchema.parse(extractJson(content))
  return normalizeEditUpdate(parsed)
}

const SearchCriteriaSchema = z.object({
  searchText: z.string().optional(),
  type: LearningItemType.optional(),
  excludeType: LearningItemType.optional(),
  status: LearningItemStatus.optional(),
  excludeStatus: LearningItemStatus.optional(),
  progressMin: z.string().optional(),
  progressMax: z.string().optional(),
})

type SearchCriteria = z.infer<typeof SearchCriteriaSchema>

function buildSearchSystemPrompt() {
  return [
    'You extract search criteria from a user search query.',
    'Return ONLY a JSON object with these optional keys:',
    'searchText, type, excludeType, status, excludeStatus, progressMin, progressMax.',
    '',
    'Rules:',
    '- searchText: keywords to search in title or author (e.g., "pragmatic", "programming")',
    '- type: one of "Book", "Course", "Article" if user specifies a type to include',
    '- excludeType: one of "Book", "Course", "Article" if user wants to exclude a type',
    '- status: one of "In Progress", "Completed", "On Hold", "Archived" if user specifies a status to include',
    '- excludeStatus: one of "In Progress", "Completed", "On Hold", "Archived" if user wants to exclude a status',
    '- progressMin: minimum progress (e.g., "50%" for "more than 50%", "at least 50%")',
    '- progressMax: maximum progress (e.g., "30%" for "less than 30%", "under 30%")',
    '- If user says "completed items", set status to "Completed"',
    '- If user says "in progress", set status to "In Progress"',
    '- If user says "archived", set status to "Archived"',
    '- If user says "not archived", "non-archived", "exclude archived", or "without archived", set excludeStatus to "Archived"',
    '- If user says "not completed", "non-completed", "exclude completed", set excludeStatus to "Completed"',
    '- If user says "not in progress", "exclude in progress", set excludeStatus to "In Progress"',
    '- If user says "books", "book", set type to "Book"',
    '- If user says "courses", "course", set type to "Course"',
    '- If user says "articles", "article", set type to "Article"',
    '- If user says "not a book", "not books", "exclude books", "non-books", set excludeType to "Book"',
    '- If user says "not a course", "not courses", "exclude courses", "non-courses", set excludeType to "Course"',
    '- If user says "not an article", "not articles", "exclude articles", "non-articles", set excludeType to "Article"',
    '- Extract keywords from the query for searchText',
    '- If no specific criteria, return empty object or just searchText',
  ].join('\n')
}

function normalizeSearchCriteria(parsed: SearchCriteria) {
  const normalized: SearchCriteria = {}

  if (parsed.searchText !== undefined && parsed.searchText.trim()) {
    normalized.searchText = parsed.searchText.trim()
  }
  if (parsed.type !== undefined) {
    normalized.type = parsed.type
  }
  if (parsed.excludeType !== undefined) {
    normalized.excludeType = parsed.excludeType
  }
  if (parsed.status !== undefined) {
    normalized.status = parsed.status
  }
  if (parsed.excludeStatus !== undefined) {
    normalized.excludeStatus = parsed.excludeStatus
  }
  if (parsed.progressMin !== undefined && parsed.progressMin.trim()) {
    normalized.progressMin = parsed.progressMin.trim()
  }
  if (parsed.progressMax !== undefined && parsed.progressMax.trim()) {
    normalized.progressMax = parsed.progressMax.trim()
  }

  return normalized
}

async function callProviderForSearch(
  config: ProviderConfig,
  message: string
) {
  const systemPrompt = buildSearchSystemPrompt()
  const payload = {
    model: config.model,
    stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  }

  const url =
    config.provider === 'ollama'
      ? `${config.baseUrl}/api/chat`
      : `${config.baseUrl}/v1/chat/completions`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (config.provider === 'deepseek' && config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`LLM request failed (${response.status})`)
  }

  return response.json() as Promise<any>
}

export async function parseSearchQuery(message: string) {
  const config = getProviderConfig()
  const data = await callProviderForSearch(config, message)
  const content = extractContent(config.provider, data)
  const parsed = SearchCriteriaSchema.parse(extractJson(content))
  return normalizeSearchCriteria(parsed)
}
