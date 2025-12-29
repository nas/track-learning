import { NextResponse } from 'next/server'
import { parseSearchQuery } from '@/services/learningItemParser'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const criteria = await parseSearchQuery(query)
    return NextResponse.json({ criteria })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to parse search query' },
      { status: 500 }
    )
  }
}

