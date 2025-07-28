import { internalApi } from '@/shared/config/api'

export interface Video {
  id: string
  title: string
  description?: string
  url: string
  thumbnail?: string
  duration: number
  isPremium: boolean
  user_id: string
  model_id: string
  created_at: string
  updated_at: string
}

export interface CreateVideoData {
  title: string
  description?: string
  url: string
  thumbnail?: string
  duration: number
  isPremium: boolean
  user_id: string
  model_id: string
}

export interface UpdateVideoData {
  title?: string
  description?: string
  url?: string
  thumbnail?: string
  duration?: number
  isPremium?: boolean
}

export const videoService = {
  // Get all videos
  getVideos: async () => {
    const response = await internalApi.get<Video[]>('/videos')
    return response.data
  },

  // Get a specific video
  getVideo: async (id: string) => {
    const response = await internalApi.get<Video>(`/videos/${id}`)
    return response.data
  },

  // Create a new video
  createVideo: async (data: CreateVideoData) => {
    const response = await internalApi.post<Video>('/videos', data)
    return response.data
  },

  // Update a video
  updateVideo: async (id: string, data: UpdateVideoData) => {
    const response = await internalApi.put<Video>(`/videos/${id}`, data)
    return response.data
  },

  // Delete a video
  deleteVideo: async (id: string) => {
    const response = await internalApi.delete<void>(`/videos/${id}`)
    return response.data
  }
} 