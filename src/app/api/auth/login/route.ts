import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === process.env.AUTH_SECRET) {
      const response = NextResponse.json({ success: true })
      
      // Set a simple session cookie
      // In a real app, this would be a signed JWT or session ID
      response.cookies.set('session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })

      return response
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
