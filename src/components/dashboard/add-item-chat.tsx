'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAddItem } from '@/hooks/useAddItem'
import { useParseItem } from '@/hooks/useParseItem'
import { AddLearningItemInput } from '@/lib/schemas/learning-item'

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

function formatItemSummary(item: AddLearningItemInput) {
  const parts = [
    `Title: ${item.title}`,
    `Author: ${item.author}`,
    `Type: ${item.type}`,
    `Status: ${item.status}`,
    `Progress: ${item.progress}`,
  ]
  if (item.url) {
    parts.push(`URL: ${item.url}`)
  }
  return parts.join('\n')
}

export function AddItemChat({ onSuccess }: { onSuccess?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Tell me what you want to add. Example: "The Pragmatic Programmer by Andy Hunt, 20% in, started today."',
    },
  ])
  const [input, setInput] = useState('')
  const [pendingItem, setPendingItem] = useState<AddLearningItemInput | null>(
    null
  )
  const [error, setError] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const { mutateAsync: parseItem, isPending: isParsing } = useParseItem()
  const { mutate: addItem, isPending: isAdding } = useAddItem()

  const isBusy = isParsing || isAdding
  const canSend = input.trim().length > 0 && !isBusy

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, pendingItem])

  const summary = useMemo(
    () => (pendingItem ? formatItemSummary(pendingItem) : ''),
    [pendingItem]
  )

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isBusy) {
      return
    }

    setInput('')
    setError('')
    setPendingItem(null)
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])

    try {
      const item = await parseItem(trimmed)
      setPendingItem(item)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Here is what I understood. Review and confirm, or add a correction.',
        },
      ])
    } catch (parseError) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I had trouble extracting the details. Try adding the title and author, and I will try again.',
        },
      ])
      setError('Parsing failed. Please try a more detailed description.')
    }
  }

  const handleConfirm = () => {
    if (!pendingItem) {
      return
    }

    addItem(pendingItem, {
      onSuccess: () => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Added! Want to log another one?',
          },
        ])
        setPendingItem(null)
        onSuccess?.()
      },
      onError: () => {
        setError('Saving failed. Please try again.')
      },
    })
  }

  const handleReset = () => {
    setPendingItem(null)
    setError('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={listRef}
        className="max-h-72 overflow-y-auto rounded-2xl bg-muted/20 p-4 space-y-3"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isParsing && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-gray-50 text-foreground">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {pendingItem && (
        <div className="rounded-2xl bg-background p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold">Parsed details</p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConfirm} disabled={isBusy}>
              {isAdding ? 'Adding...' : 'Confirm & Add'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isBusy}
            >
              Make a correction
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="chat-input" className="text-sm font-semibold">
          Your message
        </label>
        <textarea
          id="chat-input"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder='e.g. "Atomic Habits by James Clear, 35% done, started Jan 2, url https://..."'
          className="w-full rounded-2xl border border-gray-200 bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleSend} disabled={!canSend}>
          {isParsing ? 'Parsing...' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
