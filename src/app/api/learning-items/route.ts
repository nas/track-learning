import { NextResponse } from 'next/server'
import { getLearningItems } from '@/services/learningService'

export async function GET() {
  const items = await getLearningItems()
  return NextResponse.json(items)
}
