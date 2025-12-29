import { NextResponse } from 'next/server'
import { parseEditItemFromMessage } from '@/services/learningItemParser'
import { LearningItem } from '@/lib/schemas/learning-item'

export async function POST(request: Request) {
  try {
    const { message, item } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!item || typeof item !== 'object') {
      return NextResponse.json({ error: 'Item is required' }, { status: 400 })
    }

    const updates = await parseEditItemFromMessage(message, item as LearningItem)
    return NextResponse.json({ updates })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to parse edit updates' },
      { status: 500 }
    )
  }
}

