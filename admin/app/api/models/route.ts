import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { externalApi } from '../../../shared/config/api'

export async function GET() {
  try {
    const response = await externalApi.get('/models')
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await externalApi.post('/models', body)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
} 