import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { externalApi } from '@/shared/config/api'

export async function GET(request: NextRequest) {
  try {
    const response = await externalApi.get('/videos')
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await externalApi.post('/videos', body)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
} 