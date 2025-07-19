import { internalApi } from '@/shared/config/api'

export interface User {
  ID: number
  name: string
  email: string
  nickname: string
  balance: number
  avatarUrl: string
  isAdmin: boolean
}

export interface CreateUserData {
  name: string
  email: string
  nickname: string
  password: string
  avatarUrl?: string
  isAdmin?: boolean
}

export interface UpdateUserData {
  name?: string
  nickname?: string
  avatarUrl?: string
  isAdmin?: boolean
  balance?: number
}

export const userService = {
  // Get all users
  getUsers: async () => {
    const response = await internalApi.get<User[]>('/users')
    return response.data
  },

  // Get a specific user
  getUser: async (id: number) => {
    const response = await internalApi.get<User>(`/users/${id}`)
    return response.data
  },

  // Create a new user
  createUser: async (data: CreateUserData) => {
    const response = await internalApi.post<User>('/users', data)
    return response.data
  },

  // Update a user
  updateUser: async (id: number, data: UpdateUserData) => {
    const response = await internalApi.put<User>(`/users/${id}`, data)
    return response.data
  },

  // Delete a user
  deleteUser: async (id: number) => {
    const response = await internalApi.delete<void>(`/users/${id}`)
    return response.data
  }
} 