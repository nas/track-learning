import { z } from 'zod'
import {
  AddLearningItemSchema,
  LearningItemStatus,
  LearningItemType,
} from '@/lib/schemas/learning-item'

const PartialLearningItemSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
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
    'title, author, type, status, progress, url, startDate.',
    'Use enums: type in ["Book","Course","Article"], status in ["In Progress","Completed","On Hold","Archived"].',
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
  const normalized = {
    title: parsed.title?.trim() ?? '',
    author: parsed.author?.trim() || 'Unknown',
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
  const parsed = PartialLearningItemSchema.parse(extractJson(content))
  return normalizeParsedItem(parsed, nowIso)
}
