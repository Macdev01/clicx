import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { externalApi } from '../../../../shared/config/api'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const response = await externalApi.get(`/users/${params.id}`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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
    const response = await externalApi.put(`/users/${params.id}`, body)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
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
    const response = await externalApi.delete(`/users/${params.id}`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
} 