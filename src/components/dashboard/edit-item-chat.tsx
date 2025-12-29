'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useUpdateItem } from '@/hooks/useUpdateItem'
import { useParseEditItem, EditItemUpdates } from '@/hooks/useParseEditItem'
import { LearningItem } from '@/lib/schemas/learning-item'

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

function formatCurrentItem(item: LearningItem) {
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

function formatUpdates(updates: EditItemUpdates, currentItem: LearningItem) {
  const changes: string[] = []
  
  if (updates.status !== undefined && updates.status !== currentItem.status) {
    changes.push(`Status: ${currentItem.status} → ${updates.status}`)
  }
  if (updates.progress !== undefined && updates.progress !== currentItem.progress) {
    changes.push(`Progress: ${currentItem.progress} → ${updates.progress}`)
  }
  if (updates.url !== undefined && updates.url !== (currentItem.url || '')) {
    if (updates.url) {
      changes.push(`URL: ${currentItem.url || '(none)'} → ${updates.url}`)
    } else {
      changes.push(`URL: ${currentItem.url || '(none)'} → (removed)`)
    }
  }
  
  return changes.length > 0 ? changes.join('\n') : 'No changes detected'
}

interface EditItemChatProps {
  item: LearningItem
  onSuccess?: () => void
}

export function EditItemChat({ item, onSuccess }: EditItemChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Here's the current item:\n\n${formatCurrentItem(item)}\n\nWhat would you like to change? You can update the status, progress, or URL. You can also archive this item.`,
    },
  ])
  const [input, setInput] = useState('')
  const [pendingUpdates, setPendingUpdates] = useState<EditItemUpdates | null>(
    null
  )
  const [error, setError] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const { mutateAsync: parseEdit, isPending: isParsing } = useParseEditItem()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem()

  const isBusy = isParsing || isUpdating
  const canSend = input.trim().length > 0 && !isBusy

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, pendingUpdates])

  const isArchiving = useMemo(() => {
    return pendingUpdates?.status === 'Archived'
  }, [pendingUpdates])

  const changesSummary = useMemo(
    () => (pendingUpdates ? formatUpdates(pendingUpdates, item) : ''),
    [pendingUpdates, item]
  )

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isBusy) {
      return
    }

    setInput('')
    setError('')
    setPendingUpdates(null)
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])

    try {
      const updates = await parseEdit({ message: trimmed, item })
      setPendingUpdates(updates)
      
      let responseMessage = 'Here is what I understood. Review and confirm, or add a correction.'
      if (updates.status === 'Archived') {
        responseMessage = 'I will archive this item. Review the changes and confirm, or add a correction.'
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: responseMessage,
        },
      ])
    } catch (parseError) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I had trouble understanding what you want to change. Try being more specific about what to update (status, progress, or URL).',
        },
      ])
      setError('Parsing failed. Please try a more detailed description.')
    }
  }

  const handleConfirm = () => {
    if (!pendingUpdates) {
      return
    }

    updateItem(
      { id: item.id, updates: pendingUpdates },
      {
        onSuccess: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: isArchiving
                ? 'Item archived! Anything else you want to change?'
                : 'Updated! Want to make more changes?',
            },
          ])
          setPendingUpdates(null)
          onSuccess?.()
        },
        onError: () => {
          setError('Saving failed. Please try again.')
        },
      }
    )
  }

  const handleReset = () => {
    setPendingUpdates(null)
    setError('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={listRef}
        className="max-h-72 overflow-y-auto rounded-2xl border bg-muted/20 p-4 space-y-3"
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
                  : 'bg-white text-foreground border'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isParsing && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm border bg-white text-foreground">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {pendingUpdates && (
        <div className="rounded-2xl border bg-background p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold">
              {isArchiving ? 'Changes (including archiving)' : 'Changes'}
            </p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {changesSummary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConfirm} disabled={isBusy}>
              {isUpdating
                ? isArchiving
                  ? 'Archiving...'
                  : 'Saving...'
                : isArchiving
                  ? 'Confirm & Archive'
                  : 'Confirm & Save'}
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
        <label htmlFor="edit-chat-input" className="text-sm font-semibold">
          Your message
        </label>
        <textarea
          id="edit-chat-input"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder='e.g. "Update progress to 75%", "Archive this", "Set status to Completed and progress to 100%"'
          className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

