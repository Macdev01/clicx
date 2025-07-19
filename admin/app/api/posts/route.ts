import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { externalApi } from '@/shared/config/api'

export async function GET(request: NextRequest) {
  try {
    const response = await externalApi.get('/posts')
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await externalApi.post('/posts', body)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
} 