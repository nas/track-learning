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
  type: z.union([LearningItemType, z.array(LearningItemType)]).optional(),
  excludeType: z.union([LearningItemType, z.array(LearningItemType)]).optional(),
  status: z.union([LearningItemStatus, z.array(LearningItemStatus)]).optional(),
  excludeStatus: z.union([LearningItemStatus, z.array(LearningItemStatus)]).optional(),
  progressMin: z.string().optional(),
  progressMax: z.string().optional(),
})

type SearchCriteria = z.infer<typeof SearchCriteriaSchema>

function buildSearchSystemPrompt() {
  // Extract enum values dynamically from schema
  // Zod enums store values in _def.entries object
  const validTypes = Object.values((LearningItemType._def as any).entries) as string[]
  const validStatuses = Object.values((LearningItemStatus._def as any).entries) as string[]
  
  return [
    'You extract search criteria from a user search query.',
    'Return ONLY a JSON object with these optional keys:',
    'searchText, type, excludeType, status, excludeStatus, progressMin, progressMax.',
    '',
    'Field definitions:',
    `- type: string or array - valid values: ${validTypes.map(t => `"${t}"`).join(', ')}`,
    `- excludeType: string or array - valid values: ${validTypes.map(t => `"${t}"`).join(', ')}`,
    `- status: string or array - valid values: ${validStatuses.map(s => `"${s}"`).join(', ')}`,
    `- excludeStatus: string or array - valid values: ${validStatuses.map(s => `"${s}"`).join(', ')}`,
    '- searchText: string - keywords to search in title or author',
    '- progressMin: string - minimum progress (e.g., "20%" for "more than 20%")',
    '- progressMax: string - maximum progress (e.g., "30%" for "less than 30%")',
    '',
    'Rules:',
    '- Use a single string for one value, an array for multiple values (OR logic)',
    '- For "not X" or "exclude X", use excludeType or excludeStatus',
    '- Omit fields that are not applicable (do not use empty strings)',
    '',
    'Examples:',
    'Query: "find items that are books and more than 20% complete"',
    'Response: {"type": "Book", "progressMin": "20%"}',
    '',
    'Query: "find items that are course or book"',
    'Response: {"type": ["Course", "Book"]}',
    '',
    'Query: "find items that are not course or book"',
    'Response: {"excludeType": ["Course", "Book"]}',
    '',
    'Query: "find completed or in progress items"',
    'Response: {"status": ["Completed", "In Progress"]}',
    '',
    'Query: "find items that are not archived"',
    'Response: {"excludeStatus": "Archived"}',
  ].join('\n')
}

function normalizeSearchCriteria(parsed: SearchCriteria) {
  const normalized: {
    searchText?: string
    type?: LearningItemType | LearningItemType[]
    excludeType?: LearningItemType | LearningItemType[]
    status?: LearningItemStatus | LearningItemStatus[]
    excludeStatus?: LearningItemStatus | LearningItemStatus[]
    progressMin?: string
    progressMax?: string
  } = {}

  if (parsed.searchText !== undefined && parsed.searchText.trim()) {
    normalized.searchText = parsed.searchText.trim()
  }
  if (parsed.type !== undefined) {
    // Keep arrays as arrays, single values as single values
    normalized.type = parsed.type
  }
  if (parsed.excludeType !== undefined) {
    // Keep arrays as arrays, single values as single values
    normalized.excludeType = parsed.excludeType
  }
  if (parsed.status !== undefined) {
    // Keep arrays as arrays, single values as single values
    normalized.status = parsed.status
  }
  if (parsed.excludeStatus !== undefined) {
    // Keep arrays as arrays, single values as single values
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

function preprocessSearchCriteria(raw: any): any {
  const preprocessed: any = { ...raw }
  
  const validTypes = ['Book', 'Course', 'Article']
  const validStatuses = ['In Progress', 'Completed', 'On Hold', 'Archived']
  
  // Helper to clean enum fields - supports arrays for multiple values
  const cleanEnumField = (field: string, validValues: string[]) => {
    if (preprocessed[field] === undefined || preprocessed[field] === null) {
      delete preprocessed[field]
      return
    }
    
    // Handle empty strings
    if (preprocessed[field] === '') {
      delete preprocessed[field]
      return
    }
    
    // Handle arrays
    if (Array.isArray(preprocessed[field])) {
      if (preprocessed[field].length === 0) {
        delete preprocessed[field]
        return
      }
      
      // Filter to only valid values
      const validArray = preprocessed[field].filter((v: string) => validValues.includes(v))
      
      if (validArray.length === 0) {
        delete preprocessed[field]
        return
      }
      
      // If all enum values are present, remove it (LLM confusion)
      if (validArray.length === validValues.length && 
          validValues.every(v => validArray.includes(v))) {
        delete preprocessed[field]
        return
      }
      
      // If only one valid value, use single value
      if (validArray.length === 1) {
        preprocessed[field] = validArray[0]
      } else {
        // Multiple valid values - keep as array
        preprocessed[field] = validArray
      }
      return
    }
    
    // Handle single values
    if (!validValues.includes(preprocessed[field])) {
      delete preprocessed[field]
      return
    }
  }
  
  // Clean enum fields
  cleanEnumField('type', validTypes)
  cleanEnumField('excludeType', validTypes)
  cleanEnumField('status', validStatuses)
  cleanEnumField('excludeStatus', validStatuses)
  
  // Also clean empty strings from other fields
  if (preprocessed.searchText === '') {
    delete preprocessed.searchText
  }
  if (preprocessed.progressMin === '') {
    delete preprocessed.progressMin
  }
  if (preprocessed.progressMax === '') {
    delete preprocessed.progressMax
  }
  
  return preprocessed
}

export async function parseSearchQuery(message: string) {
  const config = getProviderConfig()
  const data = await callProviderForSearch(config, message)
  const content = extractContent(config.provider, data)
  const rawJson = extractJson(content)
  console.log('Raw JSON from LLM:', JSON.stringify(rawJson, null, 2))
  const preprocessed = preprocessSearchCriteria(rawJson)
  console.log('Preprocessed:', JSON.stringify(preprocessed, null, 2))
  const parsed = SearchCriteriaSchema.parse(preprocessed)
  return normalizeSearchCriteria(parsed)
}
