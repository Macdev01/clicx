import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Set session cookie
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    // Create the response
    const response = NextResponse.json({ success: true })

    // Set the cookie in the response
    response.cookies.set('__session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error setting session:', error)
    return NextResponse.json(
      { error: 'Failed to set session' },
      { status: 500 }
    )
  }
}

// Delete session cookie
export async function DELETE() {
  // Create the response
  const response = NextResponse.json({ success: true })

  // Delete the cookie
  response.cookies.delete('__session')

  return response
} 