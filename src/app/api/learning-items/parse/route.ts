import { NextResponse } from 'next/server'
import { parseLearningItemFromMessage } from '@/services/learningItemParser'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const item = await parseLearningItemFromMessage(message)
    return NextResponse.json({ item })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to parse learning item' },
      { status: 500 }
    )
  }
}
