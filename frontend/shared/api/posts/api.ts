import type { Post, PostsResponse } from "@/shared/types/post"

import { apiClient } from "../config/axios"

export const postsApi = {
  getPosts: async (): Promise<PostsResponse> => {
    const { data } = await apiClient.get<PostsResponse>("/posts")
    return data
  },

  getPost: async (id: number): Promise<Post> => {
    const { data } = await apiClient.get<Post>(`/posts/${id}`)
    return data
  },
}
