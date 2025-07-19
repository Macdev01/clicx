import { internalApi } from '@/shared/config/api'

export interface Model {
  id: number
  user_id: number
  bio: string
  banner: string
}

export interface CreateModelData {
  user_id: number
  bio: string
  banner: string
}

export interface UpdateModelData {
  user_id?: number
  bio?: string
  banner?: string
}

export const modelService = {
  // Get all models
  getModels: async () => {
    const response = await internalApi.get<Model[]>('/models')
    return response.data
  },

  // Get a specific model
  getModel: async (id: number) => {
    const response = await internalApi.get<Model>(`/models/${id}`)
    return response.data
  },

  // Create a new model
  createModel: async (data: CreateModelData) => {
    const response = await internalApi.post<Model>('/models', data)
    return response.data
  },

  // Update a model
  updateModel: async (id: number, data: UpdateModelData) => {
    const response = await internalApi.put<Model>(`/models/${id}`, data)
    return response.data
  },

  // Delete a model
  deleteModel: async (id: number) => {
    const response = await internalApi.delete<void>(`/models/${id}`)
    return response.data
  }
} 