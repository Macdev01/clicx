import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { externalApi } from '../../../../shared/config/api'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const response = await externalApi.get(`/videos/${params.id}`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    const response = await externalApi.put(`/videos/${params.id}`, body)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const response = await externalApi.delete(`/videos/${params.id}`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
} 