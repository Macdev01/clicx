import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { externalApi } from '../../../shared/config/api'

// Get all users
export async function GET() {
  try {
    const response = await externalApi.get('/users')
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await externalApi.post('/users', body)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 