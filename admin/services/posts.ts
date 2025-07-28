import { internalApi } from '@/shared/config/api'

interface User {
  ID: string
  name: string
  email: string
  nickname: string
  balance: number
  avatarUrl: string
  isAdmin: boolean
}

interface Model {
  id: string
  user_id: string
  bio: string
  banner: string
}

interface Media {
  id: string
  post_id: string
  type: string
  url: string
  cover: string
  duration: number
  createdAt: string
}

export interface Post {
  id: string
  text: string
  isPremium: boolean
  published_time: string
  likes_count: number
  user: User
  model: Model
  media: Media[]
  comments: any[] | null
  isPurchased: boolean
}

export interface CreatePostData {
  text: string
  isPremium: boolean
  user_id: string
  model_id: string
  media?: {
    type: string
    url: string
    cover: string
    duration: number
  }[]
}

export interface UpdatePostData {
  text?: string
  isPremium?: boolean
  media?: {
    type: string
    url: string
    cover: string
    duration: number
  }[]
}

export const postService = {
  // Get all posts
  getPosts: async () => {
    const response = await internalApi.get<Post[]>('/posts')
    return response.data
  },

  // Get a specific post
  getPost: async (id: string) => {
    const response = await internalApi.get<Post>(`/posts/${id}`)
    return response.data
  },

  // Create a new post
  createPost: async (data: CreatePostData) => {
    const response = await internalApi.post<Post>('/posts', data)
    return response.data
  },

  // Update a post
  updatePost: async (id: string, data: UpdatePostData) => {
    const response = await internalApi.put<Post>(`/posts/${id}`, data)
    return response.data
  },

  // Delete a post
  deletePost: async (id: string) => {
    const response = await internalApi.delete<void>(`/posts/${id}`)
    return response.data
  }
} 