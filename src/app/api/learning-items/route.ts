import { NextResponse } from 'next/server'
import { getLearningItems, addLearningItem } from '@/services/learningService'

export async function GET() {
  const items = await getLearningItems()
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const newItem = await addLearningItem(json)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}